import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isNumber } from "../../../util";

/**
 * Checks if the specified expression resolves to a numeric value
 */
export const $isNumber: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): boolean | null => {
  const n = computeValue(obj, expr, null, options);
  return isNumber(n);
};
