import { Iterator } from "../../lazy";
import { Any, Options } from "../../types";
import { $group } from "./group";
import { $sort } from "./sort";

/**
 * Groups incoming documents based on the value of a specified expression,
 * then computes the count of documents in each distinct group.
 *
 * {@link https://docs.mongodb.com/manual/reference/operator/aggregation/sortByCount/ usage}.
 */
export function $sortByCount(
  collection: Iterator,
  expr: Any,
  options: Options
): Iterator {
  return $sort(
    $group(collection, { _id: expr, count: { $sum: 1 } }, options),
    { count: -1 },
    options
  );
}
