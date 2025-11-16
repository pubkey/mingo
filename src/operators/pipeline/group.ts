import { ComputeOptions, computeValue } from "../../core/_internal";
import { Iterator, Source } from "../../lazy";
import {
  Any,
  AnyObject,
  Callback,
  Options,
  PipelineOperator
} from "../../types";
import { assert, groupBy, has } from "../../util";

// lookup key for grouping
const ID_KEY = "_id";

interface InputExpr extends AnyObject {
  [ID_KEY]: Any;
}

/**
 * Separates documents into groups according to a "group key" and output one document for each unique group key.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/group usage}.
 *
 * @param collection
 * @param expr
 * @param options
 * @returns
 */
export const $group: PipelineOperator = (
  collection: Iterator,
  expr: InputExpr,
  options: Options
): Iterator => {
  assert(has(expr, ID_KEY), "$group specification must include an '_id'");
  const idExpr = expr[ID_KEY];
  const copts = ComputeOptions.init(options);

  const newFields = Object.keys(expr).filter(k => k != ID_KEY);

  return collection.transform(((coll: Any[]) => {
    const partitions = groupBy(
      coll,
      obj => computeValue(obj, idExpr, null, options),
      options.hashFunction
    );

    let i = -1;
    const partitionKeys = Array.from(partitions.keys());

    return () => {
      if (++i === partitions.size) return { done: true };

      const groupId = partitionKeys[i];
      const obj: AnyObject = {};

      // exclude undefined key value
      if (groupId !== undefined) {
        obj[ID_KEY] = groupId;
      }

      // compute remaining keys in expression
      for (const key of newFields) {
        obj[key] = computeValue(
          partitions.get(groupId),
          expr[key] as AnyObject,
          null,
          copts.update({ root: null, groupId })
        );
      }

      return { value: obj, done: false };
    };
  }) as Callback<Source>);
};
