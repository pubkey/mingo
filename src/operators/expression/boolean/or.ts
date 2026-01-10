import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, truthy } from "../../../util/_internal";

/**
 * Returns true when any of its expressions evaluates to true. Accepts any number of argument expressions.
 *
 * @param obj
 * @param expr
 * @returns {boolean}
 */
export const $or: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  assert(isArray(expr), "$or expects array of expressions");
  const strict = options.useStrictMode;
  return expr.some(v => truthy(computeValue(obj, v, null, options), strict));
};
