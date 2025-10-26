import {
  CloneMode,
  CollationSpec,
  ComputeOptions,
  Options
} from "./core/_internal";
import { Lazy } from "./lazy";
import * as booleanOperators from "./operators/expression/boolean";
import * as comparisonOperators from "./operators/expression/comparison";
import {
  $addFields,
  $project,
  $replaceRoot,
  $replaceWith,
  $set,
  $sort,
  $unset
} from "./operators/pipeline";
import * as queryOperators from "./operators/query";
import * as UPDATE_OPERATORS from "./operators/update";
import {
  buildParams,
  Trie,
  UpdateOperator
} from "./operators/update/_internal";
import { Query } from "./query";
import { Any, AnyObject } from "./types";
import {
  assert,
  cloneDeep,
  ensureArray,
  hashCode,
  isArray,
  isEqual,
  resolve
} from "./util";

const PIPELINE_OPERATORS = {
  $addFields,
  $set,
  $project,
  $unset,
  $replaceRoot,
  $replaceWith
} as const;

type StageName = keyof typeof PIPELINE_OPERATORS;

export type PipelineStage =
  | { $addFields: AnyObject }
  | { $set: AnyObject }
  | { $project: AnyObject }
  | { $unset: string | string[] }
  | { $replaceRoot: { newRoot: AnyObject } }
  | { $replaceWith: AnyObject };

export type UpdateExpression = Partial<
  Record<keyof typeof UPDATE_OPERATORS, AnyObject>
>;

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

/**
 * Updates the given object with the expression.
 *
 * @param obj The object to update.
 * @param updateExpr The update expressions.
 * @param arrayFilters Filters to apply to nested items.
 * @param condition Conditions to validate before performing update.
 * @param options Update options to override defaults.
 * @returns {string[]} A list of modified field paths in the object.
 */
export function update(
  obj: AnyObject,
  updateExpr: UpdateExpression,
  arrayFilters?: AnyObject[],
  condition?: AnyObject,
  options?: {
    cloneMode?: CloneMode;
    queryOptions?: Partial<Options>;
  }
): string[] {
  // NOTE: pipeline operators are not supported for this function since they may replace the entire object within the collection.
  const docs = [obj];
  const res = updateOne(
    docs,
    condition || {},
    updateExpr,
    { arrayFilters, cloneMode: options?.cloneMode ?? "copy" },
    options?.queryOptions
  );
  return res.modifiedFields ?? [];
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
  updateExpr: UpdateExpression | PipelineStage[],
  updateConfig: UpdateConfig = {},
  options?: Partial<Options>
): { matchedCount: number; modifiedCount: number } {
  const { modifiedCount, matchedCount } = updateDocuments(
    documents,
    condition,
    updateExpr,
    updateConfig,
    options
  );
  return { modifiedCount, matchedCount };
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
 * @returns An object containing `matchedCount`, `modifiedCount`, and `fields`.
 */
export function updateOne(
  documents: AnyObject[],
  condition: AnyObject,
  updateExpr: UpdateExpression | PipelineStage[],
  updateConfig: UpdateConfig = {},
  options?: Partial<Options>
) {
  return updateDocuments(documents, condition, updateExpr, updateConfig, {
    ...options,
    firstOnly: true
  });
}

function updateDocuments(
  documents: AnyObject[],
  condition: AnyObject,
  updateExpr: UpdateExpression | PipelineStage[],
  updateConfig: UpdateConfig = {},
  options?: Partial<Options> & { firstOnly?: boolean }
): { matchedCount: number; modifiedCount: number; modifiedFields?: string[] } {
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

  // stores the index of the firstOnly document.
  let firstOnlyIndex = -1;

  // apply first only and sort if specified
  if (firstOnly) {
    const indexes = new Map<AnyObject, number>();
    if (updateConfig.sort) {
      // sorting will mess up the index order which will require a scan to find the position to update.
      // apply minor optimization to get index of first document when no filter is specified.
      if (!filterExists) {
        docsIter = docsIter.map<AnyObject>((o, i) => {
          indexes.set(o, i);
          return o;
        });
      }
      docsIter = $sort(docsIter, updateConfig.sort, opts);
    }
    docsIter = docsIter.take(1);
    const m = filterExists ? matchedDocs : indexes;
    firstOnlyIndex = m.get(docsIter.collect<AnyObject>()[0]) ?? 0;
  }

  // docs to update
  const foundDocs = docsIter.collect<AnyObject>();
  if (foundDocs.length === 0) return { matchedCount: 0, modifiedCount: 0 };

  // USING AGGREGATION PIPELINE OPERATORS
  if (isArray(updateExpr)) {
    // indexes of documents to be updated. when indexes is empty, all documents are checked for update.
    const indexes = firstOnly
      ? [firstOnlyIndex]
      : Array.from(matchedDocs.values()); // empty when no filters applied

    // use hashing to detect changes.
    // if we have indexes, only track those documents in the index otherwise track all found documents.
    // this optimizes for the case where only a subset of documents are updated (e.g. firstOnly = true)
    const hashes = indexes.length
      ? indexes.map(i => hashCode(documents[i]))
      : foundDocs.map(o => hashCode(o));

    // the number of documents hashed equals the number of matched documents.
    const output = { matchedCount: hashes.length, modifiedCount: 0 };

    // store a copy of first only doc to track modified paths.
    const oldFirstDoc = firstOnly
      ? cloneDeep(documents[indexes[0]])
      : undefined;

    // apply pipeline stages
    let updateIter = Lazy(foundDocs);
    for (const stage of updateExpr) {
      const [op, expr] = Object.entries(stage)[0] as [string, Any];
      const pipelineOp =
        PIPELINE_OPERATORS[op as keyof typeof PIPELINE_OPERATORS];
      assert(pipelineOp, `Unknown pipeline operator: '${op}'.`);
      updateIter = pipelineOp(updateIter, expr, opts);
    }

    const matches = updateIter.collect<AnyObject>();

    // update only modified indexes if documents were filtered
    if (indexes.length) {
      assert(
        indexes.length === matches.length,
        "bug: indexes and result size must match."
      );
      for (let i = 0; i < indexes.length; i++) {
        if (hashCode(matches[i]) !== hashes[i]) {
          documents[indexes[i]] = matches[i];
          output.modifiedCount++;
        }
      }
    } else {
      // update all documents where changes occurred
      for (let i = 0; i < documents.length; i++) {
        if (hashCode(matches[i]) !== hashes[i]) {
          documents[i] = matches[i];
          output.modifiedCount++;
        }
      }
    }

    // find all the updated fields if firstOnly.
    if (firstOnly && output.modifiedCount) {
      // NOTE: might be faster to start with '!isEqual(old,new)' in some cases. profiling needed.
      const newDoc = documents[indexes[0]];
      const modifiedFields = extractUpdatedFields(
        updateExpr,
        oldFirstDoc,
        newDoc
      );
      if (!modifiedFields.length) {
        // NOTE: may want to do assert not equal here but the extraction routine is already much involved.
        output.modifiedCount = 0;
      } else {
        Object.assign(output, { modifiedFields });
      }
    }

    return output;
  }

  // USING UPDATE OPERATORS
  /*eslint import/namespace: ['error', { allowComputed: true }]*/

  // validated operators
  const unknownOp = Object.keys(updateExpr).find(op => !UPDATE_OPERATORS[op]);
  assert(!unknownOp, `Unknown update operator: '${unknownOp}'.`);

  const arrayFilters = updateConfig?.arrayFilters ?? [];

  // build parameters and add to locals
  opts.update({
    updateParams: buildParams(Object.values(updateExpr), arrayFilters, opts)
  });

  const matchedCount = foundDocs.length;
  const output = { matchedCount, modifiedCount: 0 };

  for (const doc of foundDocs) {
    let modified = false;
    for (const [op, expr] of Object.entries(updateExpr)) {
      const mutate = UPDATE_OPERATORS[op] as UpdateOperator;
      const modifiedFields = mutate(doc, expr, arrayFilters, opts);
      if (!modified && modifiedFields.length) {
        modified = true;
        if (firstOnly) Object.assign(output, { modifiedFields });
      }
    }

    output.modifiedCount += +modified;
  }

  return output;
}

/** Extracts fields added, changed, or deleted between the old and new document. */
function extractUpdatedFields(
  pipeline: PipelineStage[],
  oldDoc: AnyObject,
  newDoc: AnyObject
): string[] {
  const stageFields: string[] = [];
  for (const stage of pipeline) {
    const op = Object.keys(stage)[0] as StageName;
    switch (op) {
      case "$addFields":
      case "$set":
      case "$project":
      case "$replaceWith":
        stageFields.push(...Object.keys(stage[op] as AnyObject));
        break;
      case "$unset":
        stageFields.push(...ensureArray(stage[op] as string[]));
        break;
      case "$replaceRoot":
        stageFields.push(
          ...Object.keys((stage[op] as { newRoot: AnyObject })?.newRoot || [])
        );
        break;
    }
  }
  const stageFieldsSet = new Set(stageFields.sort());
  const stageConflictDetector = new Trie();
  const updatedStageFields: string[] = [];
  for (const key of stageFieldsSet) {
    if (
      stageConflictDetector.add(key) &&
      !isEqual(resolve(newDoc, key), resolve(oldDoc, key))
    ) {
      updatedStageFields.push(key);
    }
  }
  // for all top-level keys in oldDoc not in stage fields conflict, add to the updated fields.
  // this addresses cases where the entire object is replaced.
  for (const key of Object.keys(oldDoc)) {
    if (stageFieldsSet.has(key)) continue;
    if (!stageConflictDetector.add(key) || !isEqual(newDoc[key], oldDoc[key])) {
      // (1) conflict detected because child keys already exiss.
      //     since we don't know the state of sibling fields we must replace with top-level field instead.
      // (2) no conflict so we must check values and key only if not equal.
      updatedStageFields.push(key);
    }
  }
  // sort the final list and pick only the parent key paths.
  const topLevelFilter = new Trie();
  return updatedStageFields.sort().filter(key => topLevelFilter.add(key));
}
