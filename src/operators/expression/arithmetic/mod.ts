import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";

/**
 * Takes two numbers and calculates the modulo of the first number divided by the second.
 *
 * @param obj
 * @param expr
 * @returns {number}
 */
export const $mod: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  const args = computeValue(obj, expr, null, options) as number[];
  return args[0] % args[1];
};
