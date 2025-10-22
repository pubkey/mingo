import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, compare, isArray } from "../../../util";

/**
 * Compares two values and returns the result of the comparison as an integer.
 *
 * @param obj
 * @param expr
 * @returns {number}
 */
export const $cmp: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as Any[];
  assert(
    isArray(args) && args.length == 2,
    "$cmp: expression must resolve to array of size 2."
  );
  return compare(args[0], args[1]);
};
