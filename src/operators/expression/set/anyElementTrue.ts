import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, truthy } from "../../../util/_internal";
import { errExpectArray } from "../_internal";

/**
 * Returns true if any elements of a set evaluate to true, and false otherwise.
 * @param obj
 * @param expr
 */
export const $anyElementTrue: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  // accepts array or expression
  if (isArray(expr)) {
    if (expr.length === 0) return false;
    assert(expr.length === 1, "$anyElementTrue expects array(1)");
    expr = expr[0];
  }
  const foe = options.failOnError;
  const args = computeValue(obj, expr, null, options) as Any[];
  if (!isArray(args)) return errExpectArray(foe, `$anyElementTrue argument`);
  return args.some(v => truthy(v, options.useStrictMode));
};
