import { Options, PipelineOperator } from "../../core/_internal";
import { Iterator } from "../../lazy";

/**
 * Skips the first n documents where n is the specified skip number and passes the remaining documents unmodified to the pipeline.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/skip usage}.
 *
 * @param collection
 * @param expr
 * @param _options
 * @returns
 */
export const $skip: PipelineOperator = (
  collection: Iterator,
  expr: number,
  _options: Options
): Iterator => {
  return collection.drop(expr);
};
