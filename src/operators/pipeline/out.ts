import { Options, PipelineOperator } from "../../core/_internal";
import { Iterator } from "../../lazy";
import { AnyObject } from "../../types";
import { assert, cloneDeep, isArray, isString } from "../../util";

/**
 * Takes the documents returned by the aggregation pipeline and writes them to a specified collection.
 *
 * Unlike in MongoDB, this operator can appear in any position in the pipeline and is
 * useful for collecting intermediate results of an aggregation operation.
 *
 * Note: Object are deep cloned for output regardless of the {@link ProcessingMode}.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/out/ usage}.
 *
 * @param collection
 * @param expr
 * @param options
 * @returns
 */
export const $out: PipelineOperator = (
  collection: Iterator,
  expr: string | AnyObject[],
  options: Options
): Iterator => {
  const outputColl: AnyObject[] = isString(expr)
    ? options?.collectionResolver(expr)
    : expr;
  assert(isArray(outputColl), `expression must resolve to an array`);

  return collection.map((o: AnyObject) => {
    outputColl.push(cloneDeep(o));
    return o; // passthrough
  });
};
