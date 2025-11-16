import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isNil, isNumber } from "../../../util";

/**
 * Calculates the square root of a positive number and returns the result as a double.
 *
 * @param obj
 * @param expr
 * @returns {number}
 */
export const $sqrt: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const n = computeValue(obj, expr, null, options) as number;
  if (isNil(n)) return null;
  assert(
    (isNumber(n) && n > 0) || isNaN(n),
    "$sqrt expression must resolve to non-negative number."
  );
  return Math.sqrt(n);
};
