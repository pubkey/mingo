import { Iterator } from "../../lazy";
import { Query } from "../../query";
import { AnyObject, Options } from "../../types";

/**
 * Filters the document stream to allow only matching documents to pass unmodified into the next pipeline stage.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/match usage}.
 */
export function $match(
  collection: Iterator,
  expr: AnyObject,
  options: Options
): Iterator {
  const q = new Query(expr, options);
  return collection.filter((o: AnyObject) => q.test(o));
}
