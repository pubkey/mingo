import { Iterator } from "../../lazy";
import { Options } from "../../types";

/**
 * Restricts the number of documents in an aggregation pipeline.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit/ usage}.
 */
export function $limit(
  coll: Iterator,
  expr: number,
  _options: Options
): Iterator {
  return coll.take(expr);
}
