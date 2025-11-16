import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray } from "../../../util";

/**
 * Determines if the operand is an array. Returns a boolean.
 *
 * @param  {AnyObject}  obj
 * @param  {*}  expr
 * @return {Boolean}
 */
export const $isArray: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const okArr = isArray(expr);
  assert(!okArr || expr.length === 1, "$isArray takes exactly 1 argument.");
  return isArray(computeValue(obj, okArr ? expr[0] : expr, null, options));
};
