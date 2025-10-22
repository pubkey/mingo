/**

 */

import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { truthy } from "../../../util";

/**
 * An operator that evaluates a series of case expressions. When it finds an expression which
 * evaluates to true, it returns the resulting expression for that case. If none of the cases
 * evaluate to true, it returns the default expression.
 *
 * @param obj
 * @param expr
 */
export const $switch: ExpressionOperator = (
  obj: AnyObject,
  expr: { branches: Array<{ case: Any; then: Any }>; default: Any },
  options: Options
): Any => {
  let thenExpr = null;
  // Array.prototype.find not supported in IE, hence the '.some()' proxy
  expr.branches.some((b: { case: Any; then: Any }) => {
    const condition = truthy(
      computeValue(obj, b.case, null, options),
      options.useStrictMode
    );
    if (condition) thenExpr = b.then;
    return condition;
  });

  return computeValue(
    obj,
    thenExpr !== null ? thenExpr : expr.default,
    null,
    options
  );
};
