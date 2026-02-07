import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray } from "../../../util";

/**
 * Determines if the operand is an array. Returns a boolean.
 */
export const $isArray: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  let input = expr;
  if (isArray(expr)) {
    assert(expr.length === 1, "$isArray expects array(1)");
    input = expr[0];
  }
  return isArray(evalExpr(obj, input, options));
};
