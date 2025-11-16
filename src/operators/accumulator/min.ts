import { AccumulatorOperator, Any, AnyObject, Options } from "../../types";
import { assert, compare, isArray, isEmpty, isNil } from "../../util";
import { $push } from "./push";

/**
 * Returns the minimum value.
 *
 * @param collection The input array
 * @param expr The right-hand side expression value of the operator
 * @param options to use for this operator
 */
export const $min: AccumulatorOperator = (
  collection: AnyObject[],
  expr: Any,
  options: Options
): Any => {
  const items = $push(collection, expr, options);
  if (isEmpty(items)) return null;
  assert(isArray(items), "$min: input must resolve to array");
  let min = items[0];
  for (const n of items) {
    if (isNil(n) || isNaN(n as number)) continue;
    if (compare(n, min) <= 0) min = n;
  }
  return min;
};
