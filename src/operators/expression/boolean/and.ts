import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { truthy } from "../../../util/_internal";

/**
 * Returns true only when all its expressions evaluate to true. Accepts any number of argument expressions.
 *
 * @param obj
 * @param expr
 * @returns {boolean}
 */
export const $and: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const value = computeValue(obj, expr, null, options) as Any[];
  return (
    truthy(value, options.useStrictMode) &&
    value.every(v => truthy(v, options.useStrictMode))
  );
};
