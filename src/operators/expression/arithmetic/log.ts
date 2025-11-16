import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isNil, isNumber } from "../../../util";

/**
 * Calculates the log of a number in the specified base and returns the result as a double.
 *
 * @param obj
 * @param expr
 * @returns {number}
 */
export const $log: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const args = computeValue(obj, expr, null, options) as number[];
  const msg = "$log expression must resolve to array(2) of numbers";

  assert(isArray(args) && args.length === 2, msg);
  if (args.some(isNil)) return null;

  assert(args.some(isNaN) || args.every(isNumber), msg);

  return Math.log10(args[0]) / Math.log10(args[1]);
};
