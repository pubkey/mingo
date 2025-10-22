import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";

/**
 * Takes two numbers and divides the first number by the second.
 *
 * @param obj
 * @param expr
 * @returns {number}
 */
export const $divide: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  const args = computeValue(obj, expr, null, options) as number[];
  return args[0] / args[1];
};
