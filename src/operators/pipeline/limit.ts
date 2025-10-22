import { Options, PipelineOperator } from "../../core/_internal";
import { Iterator } from "../../lazy";

/**
 * Restricts the number of documents in an aggregation pipeline.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit/ usage}.
 *
 * @param collection
 * @param value
 * @param options
 * @returns
 */
export const $limit: PipelineOperator = (
  collection: Iterator,
  expr: number,
  _options: Options
): Iterator => collection.take(expr);
