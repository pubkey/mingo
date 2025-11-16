import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { truthy } from "../../../util/_internal";

/**
 * Returns true if all elements of a set evaluate to true, and false otherwise.
 * @param obj
 * @param expr
 */
export const $allElementsTrue: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  // mongodb nests the array expression in another
  const args = computeValue(obj, expr, null, options)[0] as Any[];
  return args.every(v => truthy(v, options.useStrictMode));
};
