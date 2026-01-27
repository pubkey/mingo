import { computeValue } from "../../../core/_internal";
import {
  Any,
  AnyObject,
  ArrayOrObject,
  ExpressionOperator,
  Options
} from "../../../types";
import { assert, isArray, isObject, truthy } from "../../../util/_internal";

const err = "$cond expects array(3) or object with 'if-then-else' expressions";

/**
 * A ternary operator that evaluates one expression, and depending on the result returns the value of one following expressions.
 */
export const $cond: ExpressionOperator = (
  obj: AnyObject,
  expr: ArrayOrObject,
  options: Options
): Any => {
  let ifExpr: Any;
  let thenExpr: Any;
  let elseExpr: Any;

  if (isArray(expr)) {
    assert(expr.length === 3, err);
    ifExpr = expr[0];
    thenExpr = expr[1];
    elseExpr = expr[2];
  } else {
    assert(isObject(expr), err);
    ifExpr = expr.if;
    thenExpr = expr.then;
    elseExpr = expr.else;
  }
  const condition = truthy(
    computeValue(obj, ifExpr, null, options),
    options.useStrictMode
  );
  return computeValue(obj, condition ? thenExpr : elseExpr, null, options);
};
