import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any } from "../../../types";
import { assert, isNil, isNumber } from "../../../util";

/**
 * Raises Euler’s number (i.e. e ) to the specified exponent and returns the result.
 *
 * @param obj
 * @param expr
 * @returns {number}
 */
export const $exp: ExpressionOperator = (
  obj: object,
  expr: Any,
  options: Options
): number | null => {
  const n = computeValue(obj, expr, null, options) as number;
  if (isNil(n)) return null;
  assert(isNumber(n) || isNaN(n), "$exp expression must resolve to a number.");
  return Math.exp(n);
};
