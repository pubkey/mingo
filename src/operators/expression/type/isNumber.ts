import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { isNumber } from "../../../util";

/**
 * Checks if the specified expression resolves to a numeric value
 *
 * @param obj
 * @param expr
 */
export const $isNumber: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): boolean | null => {
  const n = computeValue(obj, expr, null, options);
  return isNumber(n);
};
