import { Options, PipelineOperator } from "../../core/_internal";
import { Iterator } from "../../lazy";
import { Query } from "../../query";
import { AnyObject } from "../../types";

/**
 * Filters the document stream to allow only matching documents to pass unmodified into the next pipeline stage.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/match usage}.
 *
 * @param collection
 * @param expr
 * @param options
 * @returns
 */
export const $match: PipelineOperator = (
  collection: Iterator,
  expr: AnyObject,
  options: Options
): Iterator => {
  const q = new Query(expr, options);
  return collection.filter((o: AnyObject) => q.test(o));
};
