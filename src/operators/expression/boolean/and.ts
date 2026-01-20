import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, truthy } from "../../../util/_internal";

/**
 * Returns true only when all its expressions evaluate to true. Accepts any number of argument expressions.
 *
 * @param obj
 * @param expr
 * @returns {boolean}
 */
export const $and: ExpressionOperator = (
  obj: AnyObject,
  expr: Any[],
  options: Options
): Any => {
  assert(isArray(expr), "$and expects array of expressions");
  const mode = options.useStrictMode;
  return expr.every(e => truthy(computeValue(obj, e, null, options), mode));
};
