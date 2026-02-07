import { ComputeOptions, evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";

/**
 * Defines variables for use within the scope of a sub-expression and returns the result of the sub-expression.
 */
export const $let: ExpressionOperator = (
  obj: AnyObject,
  expr: { vars: AnyObject; in: Any },
  options: Options
): Any => {
  // resolve vars
  const variables = {};
  for (const [key, val] of Object.entries(expr.vars)) {
    variables[key] = evalExpr(obj, val, options);
  }

  return evalExpr(
    obj,
    expr.in,
    ComputeOptions.init(options).update({ variables })
  );
};
