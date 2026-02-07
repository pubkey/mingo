import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil } from "../../../util";
import { errExpectArray } from "../_internal";

/**
 * Returns an array with the elements in reverse order.
 */
export const $reverseArray: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const arr = evalExpr(obj, expr, options) as Any[];

  if (isNil(arr)) return null;
  if (!isArray(arr))
    return errExpectArray(options.failOnError, "$reverseArray");
  return arr.slice().reverse();
};
