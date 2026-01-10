import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
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
  assert(isArray(expr) && expr.length === 2, "$cmp expects array(2)");
  const [a, b] = computeValue(obj, expr, null, options) as Any[];
  return compare(a, b);
};
