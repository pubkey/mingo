/**

 */

import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject, ArrayOrObject } from "../../../types";
import { assert, isArray, isObject, truthy } from "../../../util";

/**
 * A ternary operator that evaluates one expression,
 * and depending on the result returns the value of one following expressions.
 *
 * @param obj
 * @param expr
 */
export const $cond: ExpressionOperator = (
  obj: AnyObject,
  expr: ArrayOrObject,
  options: Options
): Any => {
  let ifExpr: Any;
  let thenExpr: Any;
  let elseExpr: Any;
  const errorMsg = "$cond: invalid arguments";
  if (isArray(expr)) {
    assert(expr.length === 3, errorMsg);
    ifExpr = expr[0];
    thenExpr = expr[1];
    elseExpr = expr[2];
  } else {
    assert(isObject(expr), errorMsg);
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
