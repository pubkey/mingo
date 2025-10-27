import { Aggregator } from "../../aggregator";
import {
  ComputeOptions,
  computeValue,
  Options,
  PipelineOperator
} from "../../core/_internal";
import { Iterator } from "../../lazy";
import { Any, AnyObject } from "../../types";
import {
  assert,
  ensureArray,
  flatten,
  HashMap,
  isArray,
  isString,
  resolve
} from "../../util";
import { filterDocumentsStage } from "./_internal";

interface InputExpr {
  /** Specifies the collection in the same database to perform the join with. */
  from: string | AnyObject[];
  /** Specifies the field from the documents input to the $lookup stage. */
  localField?: string;
  /** Specifies the field from the documents in the from collection. */
  foreignField?: string;
  /** Specifies the pipeline to run on the joined collection. The pipeline determines the resulting documents from the joined collection. */
  pipeline?: Record<string, AnyObject>[];
  /** Specifies the name of the new array field to add to the input documents. */
  as: string;
  /** Optional. Specifies variables to use in the pipeline stages. */
  let?: AnyObject;
}

/**
 * Performs a left outer join to another collection to filter in documents from the "joined" collection for processing.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/ usage}
 *
 * @param collection
 * @param expr
 * @param options
 */
export const $lookup: PipelineOperator = (
  collection: Iterator,
  expr: InputExpr,
  options: Options
): Iterator => {
  let joinColl = isString(expr.from)
    ? options?.collectionResolver(expr.from)
    : expr.from;

  const { let: letExpr, foreignField, localField } = expr;

  // we default to a valid equality match.
  // returns [match_found:boolean, matched_items:array]
  let lookupEq = (_: AnyObject): [boolean, Any[]] => [true, []];

  const { documents, pipeline } = filterDocumentsStage(
    expr.pipeline ?? [],
    options
  );
  // must provide one of expr.from or pipeline.$documents
  assert(
    !joinColl !== !documents,
    "$lookup: must specify single join input with `expr.from` or `expr.pipeline`."
  );

  joinColl = joinColl ?? documents;

  assert(
    isArray(joinColl),
    "$lookup: join collection must resolve to an array."
  );

  // handle direct key fields
  if (foreignField && localField) {
    // compute hashtable for joined collection
    const map = HashMap.init<Any, Any[]>(options.hashFunction);
    for (const doc of joinColl) {
      // add object for each value in the array.
      ensureArray(resolve(doc, foreignField) ?? null).forEach(v => {
        // minor optimization to minimize key hashing in value-map
        const xs = map.get(v);
        const arr = xs ?? [];
        arr.push(doc);
        if (arr !== xs) map.set(v, arr);
      });
    }

    // create lookup function to get matching items. optimized for when more predicates are specified by 'pipeline'.
    lookupEq = (o: AnyObject) => {
      const local = resolve(o, localField) ?? null;
      if (isArray(local)) {
        // only return the predicate result with no values since there is more to check.
        if (pipeline.length) {
          // check that matches exist for this object.
          return [local.some(v => map.has(v)), null];
        }
        // return entire result set.
        const result = Array.from(
          new Set(flatten(local.map(v => map.get(v), options.hashFunction)))
        );
        return [result.length > 0, result];
      }
      const result = map.get(local) ?? null;
      return [result !== null, result ?? []];
    };

    if (pipeline.length === 0) {
      return collection.map((obj: AnyObject) => {
        return {
          ...obj,
          [expr.as]: lookupEq(obj).pop()
        };
      });
    }
  }

  // options to use for processing each stage.
  const agg = new Aggregator(pipeline, options);
  const opts = ComputeOptions.init(options);
  return collection.map((obj: AnyObject) => {
    const vars = computeValue(obj, letExpr, null, options) as AnyObject;
    opts.update({ root: null, variables: vars });
    const [ok, res] = lookupEq(obj);
    return {
      ...obj,
      [expr.as]: ok ? agg.run(joinColl, opts) : res
    };
  });
};
