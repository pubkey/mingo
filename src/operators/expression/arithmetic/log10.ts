import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isNil } from "../../../util";
import { errExpectNumber } from "../_internal";

/**
 * Calculates the log base 10 of a number and returns the result as a double.
 */
export const $log10: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const n = computeValue(obj, expr, null, options) as number;
  if (isNil(n)) return null;
  if (typeof n === "number") return Math.log10(n);
  return errExpectNumber(options.failOnError, "$log10");
};
