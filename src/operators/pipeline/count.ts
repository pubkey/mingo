import { Iterator, Lazy } from "../../lazy";
import { Options } from "../../types";
import { assert, isString } from "../../util";

/**
 * Returns a count of the number of documents at this stage of the aggregation pipeline.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/count usage}.
 */
export function $count(
  collection: Iterator,
  expr: string,
  _options: Options
): Iterator {
  assert(
    isString(expr) &&
      expr.trim().length > 0 &&
      !expr.includes(".") &&
      expr[0] !== "$",
    "$count expression must evaluate to valid field name"
  );

  let i = 0;
  return Lazy(() => {
    if (i++ == 0) return { value: { [expr]: collection.size() }, done: false };
    return { done: true };
  });
}
