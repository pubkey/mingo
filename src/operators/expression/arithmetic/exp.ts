import { computeValue } from "../../../core/_internal";
import { Any, ExpressionOperator, Options } from "../../../types";
import { isNil } from "../../../util";
import { errExpectNumber } from "../_internal";

/**
 * Raises Euler’s number (i.e. e ) to the specified exponent and returns the result.
 */
export const $exp: ExpressionOperator = (
  obj: object,
  expr: Any,
  options: Options
): number | null => {
  const n = computeValue(obj, expr, null, options) as number;
  if (isNil(n)) return null;
  if (typeof n !== "number") {
    return errExpectNumber(options.failOnError, "$exp");
  }
  return Math.exp(n);
};
