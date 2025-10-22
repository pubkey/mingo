import { AccumulatorOperator, Options } from "../../core/_internal";
import { Any, AnyObject } from "../../types";
import { assert, compare, isArray, isEmpty, isNil } from "../../util";
import { $push } from "./push";

/**
 * Returns the maximum value
 *
 * @param collection The input array
 * @param expr The right-hand side expression value of the operator
 * @param options to use for this operator
 */
export const $max: AccumulatorOperator = (
  collection: AnyObject[],
  expr: Any,
  options: Options
): Any => {
  const items = $push(collection, expr, options);
  if (isEmpty(items)) return null;
  assert(isArray(items), "$max: input must resolve to array");
  let max = items[0];
  for (const n of items) {
    if (isNil(n) || isNaN(n as number)) continue;
    if (compare(n, max) >= 0) max = n;
  }
  return max;
};
