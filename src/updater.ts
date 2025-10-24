import {
  CloneMode,
  CollationSpec,
  ComputeOptions,
  Options
} from "./core/_internal";
import { Lazy } from "./lazy";
import * as booleanOperators from "./operators/expression/boolean";
import * as comparisonOperators from "./operators/expression/comparison";
import { $addFields } from "./operators/pipeline/addFields";
import { $project } from "./operators/pipeline/project";
import { $replaceRoot } from "./operators/pipeline/replaceRoot";
import { $replaceWith } from "./operators/pipeline/replaceWith";
import { $set } from "./operators/pipeline/set";
import { $sort } from "./operators/pipeline/sort";
import { $unset } from "./operators/pipeline/unset";
import * as queryOperators from "./operators/query";
import * as UPDATE_OPERATORS from "./operators/update";
import { buildParams, UpdateOperator } from "./operators/update/_internal";
import { Query } from "./query";
import { Any, AnyObject } from "./types";
import { assert, hashCode, isArray } from "./util";

// https://stackoverflow.com/questions/60872063/enforce-typescript-object-has-exactly-one-key-from-a-set
/** Define maps to enforce a single key from a union. */
// eslint-disable-next-line
type OneKey<K extends keyof any, V, KK extends keyof any = K> = {
  [P in K]: { [Q in P]: V } & { [Q in Exclude<KK, P>]?: never } extends infer O
    ? { [Q in keyof O]: O[Q] }
    : never;
}[K];

const PIPELINE_OPERATORS = {
  $addFields,
  $set,
  $project,
  $unset,
  $replaceRoot,
  $replaceWith
} as const;

export type UpdateExpression =
  | Partial<Record<keyof typeof UPDATE_OPERATORS, AnyObject>>
  | OneKey<keyof typeof PIPELINE_OPERATORS, Any>[];

export interface UpdateConfig {
  /** An array of filter documents that determine which array elements to modify for an update operation on an array field. */
  arrayFilters?: AnyObject[];
  /** Determines how to set values to fields. */
  cloneMode?: CloneMode;
  /** {@link updateOne} updates the first document in the sort order specified by this argument. */
  sort?: Record<string, 1 | -1>;
  /** The collation to use for the operation. Merged into {@link Options.collation} when specified. */
  collation?: CollationSpec;
  /** A document with a list of variables. Merged into {@link Options.variables} when specified. */
  let?: AnyObject;
}

/** A function to process an update expression and modify the object. */
export type Updater = (
  obj: AnyObject,
  updateExpr: UpdateExpression,
  arrayFilters?: AnyObject[],
  condition?: AnyObject,
  options?: Partial<Options>
) => string[];

/**
 * Creates a new updater function with default options.
 * @param defaultOptions The default options. Defaults to no cloning with strict mode off for queries.
 * @returns {Updater}
 */
export function createUpdater(defaultOptions?: Partial<Options>): Updater {
  // automatically load basic query options for update operators
  // const mainOptions = ComputeOptions.init(defaultOptions);
  // mainOptions.context
  //   .addQueryOps(queryOperators)
  //   .addExpressionOps(booleanOperators)
  //   .addExpressionOps(comparisonOperators);

  return (
    obj: AnyObject,
    updateExpr: UpdateExpression,
    arrayFilters: AnyObject[] = [],
    condition: AnyObject = {},
    options?: Partial<Options>
  ): string[] => {
    // apply options overrides
    const opts = ComputeOptions.init({
      ...defaultOptions,
      ...options
    });

    opts.context
      .addQueryOps(queryOperators)
      .addExpressionOps(booleanOperators)
      .addExpressionOps(comparisonOperators);

    const entry = Object.entries(updateExpr);
    const [op, args] = entry[0];
    // check operator exists
    assert(UPDATE_OPERATORS[op], `Update operator '${op}' is not supported.`);

    /*eslint import/namespace: ['error', { allowComputed: true }]*/
    opts.update({
      root: obj
    });

    // validate condition.
    if (Object.keys(condition).length) {
      const q = new Query(condition, opts);
      if (!q.test(obj)) return [] as string[];
      // set the condtion on the options
      opts.update({ condition });
    }

    // apply updates
    const mutate = UPDATE_OPERATORS[op] as UpdateOperator;
    return mutate(obj, args, arrayFilters, opts);
  };
}

/**
 * Updates the given object with the expression.
 *
 * @param obj The object to update.
 * @param expr The update expressions.
 * @param arrayFilters Filters to apply to nested items.
 * @param conditions Conditions to validate before performing update.
 * @param options Update options to override defaults.
 * @returns {string[]} A list of modified field paths in the object.
 */
export const update = createUpdater();

function updateDocuments(
  documents: AnyObject[],
  condition: AnyObject,
  updateExpr: UpdateExpression,
  updateConfig: UpdateConfig = {},
  options?: Partial<Options> & { firstOnly?: boolean }
): { matchedCount: number; modifiedCount: number } {
  // apply options overrides
  options ||= {};

  const firstOnly = options?.firstOnly ?? false;
  const opts = ComputeOptions.init({
    ...options,
    collation: Object.assign({}, options?.collation, updateConfig?.collation)
  }).update({
    condition,
    updateConfig: { cloneMode: "copy", ...updateConfig },
    variables: updateConfig.let
  });
  opts.context
    .addExpressionOps(booleanOperators)
    .addExpressionOps(comparisonOperators)
    .addQueryOps(queryOperators)
    .addPipelineOps(PIPELINE_OPERATORS);

  const filterExists = Object.keys(condition).length > 0;
  const matchedDocs = new Map<AnyObject, number>();
  let docsIter = Lazy(documents);

  if (filterExists) {
    const query = new Query(condition, opts);
    // find matching documents
    docsIter = docsIter.filter<AnyObject>((o, i) => {
      if (query.test(o)) {
        matchedDocs.set(o, i);
        return true;
      }
      return false;
    });
  }

  // apply first only and sort if specified
  if (firstOnly) {
    if (updateConfig.sort) {
      docsIter = $sort(docsIter, updateConfig.sort, opts);
    }
    docsIter = docsIter.take(1);
  }

  // docs to update
  const foundDocs = docsIter.value<AnyObject>();

  if (foundDocs.length === 0) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  // use pipeline expression
  if (isArray(updateExpr)) {
    // indexes of documents to be updated. when indexes is empty, all documents are checked for update.
    const indexes = firstOnly
      ? [matchedDocs.get(foundDocs[0]) ?? documents.indexOf(foundDocs[0])] // check in map first, then fallback to scan for index
      : Array.from(matchedDocs.values()); // empty if no filter was applied

    // use hashing to detect changes.
    // if we have indexes, only track those documents in the index otherwise track all found documents.
    // this optimizes for the case where only a subset of documents are updated (e.g. firstOnly = true)
    const hashes = indexes.length
      ? indexes.map(i => hashCode(documents[i]))
      : foundDocs.map(o => hashCode(o));

    // the number of documents hashed equals the number of matched documents.
    const matchedCount = hashes.length;

    // apply pipeline stages
    let resultIter = Lazy(foundDocs);
    for (const stage of updateExpr) {
      const [op, expr] = Object.entries(stage)[0];
      const pipelineOp =
        PIPELINE_OPERATORS[op as keyof typeof PIPELINE_OPERATORS];
      resultIter = pipelineOp(resultIter, expr, opts);
    }

    const result = resultIter.value<AnyObject>();
    let modifiedCount = 0;

    // update only modified indexes if documents were filtered
    if (indexes.length) {
      assert(
        indexes.length === result.length,
        "bug: indexes and result size must match."
      );
      for (let i = 0; i < indexes.length; i++) {
        if (hashCode(result[i]) !== hashes[i]) {
          documents[indexes[i]] = result[i];
          modifiedCount++;
        }
      }
    } else {
      // update all documents where changes occurred
      for (let i = 0; i < documents.length; i++) {
        if (hashCode(result[i]) !== hashes[i]) {
          documents[i] = result[i];
          modifiedCount++;
        }
      }
    }

    return { modifiedCount, matchedCount };
  }

  // validate operators
  const unknownOp = Object.keys(updateExpr).find(op => !UPDATE_OPERATORS[op]);
  assert(!unknownOp, `unknown update operator '${unknownOp}'`);

  const arrayFilters = updateConfig?.arrayFilters ?? [];

  // build parameters and add to locals
  opts.update({
    updateParams: buildParams(Object.values(updateExpr), arrayFilters, opts)
  });

  let modifiedCount = 0;

  for (const doc of foundDocs) {
    let modified = false;
    for (const [op, expr] of Object.entries(updateExpr)) {
      const mutate = UPDATE_OPERATORS[op] as UpdateOperator;
      const res = mutate(doc, expr, arrayFilters, opts);
      if (!modified && res.length) modified = true;
    }
    modifiedCount += +modified;
  }

  return { matchedCount: foundDocs.length, modifiedCount };
}

/**
 * Updates all documents that match the specified filter for a collection.
 *
 * Supports both aggregation pipeline updates and standard update operators.
 * Documents in the collection may be replaced or modified.
 *
 * @param documents - The array of documents to update.
 * @param condition - The query condition to match documents.
 * @param updateExpr - The update expression or aggregation pipeline stages.
 * @param updateConfig - Optional update config parameters.
 * @param options - Optional settings to control update behavior.
 * @returns An object containing `matchedCount` and `modifiedCount`.
 */
export function updateMany(
  documents: AnyObject[],
  condition: AnyObject,
  updateExpr: UpdateExpression,
  updateConfig: UpdateConfig = {},
  options?: Partial<Options>
) {
  return updateDocuments(
    documents,
    condition,
    updateExpr,
    updateConfig,
    options
  );
}

/**
 * Updates a single document within the collection based on the filter.
 *
 * Supports both aggregation pipeline updates and standard update operators.
 * Returns the number of documents matched and modified.
 * Objects in the array may be modified inplace or replaced entirely.
 *
 * @param documents - The array of documents to update.
 * @param condition - The query condition to match documents.
 * @param updateExpr - The update expression or aggregation pipeline stages.
 * @param updateConfig - Optional update config parameters.
 * @param options - Optional settings to control update behavior.
 * @returns An object containing `matchedCount` and `modifiedCount`.
 */
export function updateOne(
  documents: AnyObject[],
  condition: AnyObject,
  updateExpr: UpdateExpression,
  updateConfig: UpdateConfig = {},
  options?: Partial<Options>
) {
  return updateDocuments(documents, condition, updateExpr, updateConfig, {
    ...options,
    firstOnly: true
  });
}
