import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isEqual } from "../../../util";
import { errInvalidArgs } from "../_internal";

/**
 * Returns a boolean indicating whether a specified value is in an array.
 */
export const $in: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): boolean => {
  assert(isArray(expr) && expr.length === 2, "$in expects array(2)");
  const args = evalExpr(obj, expr, options) as [Any, Any[]];
  const [item, arr] = args;
  if (!isArray(arr))
    return errInvalidArgs(options.failOnError, "$in arg2 <array>");
  return arr.some(v => isEqual(v, item));
};
