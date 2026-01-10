import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isNil } from "../../../util";
import { errExpectNumber } from "../_internal";

/**
 * Returns the absolute value of a number.
 *
 * @param obj
 * @param expr
 * @return {Number|null|NaN}
 */
export const $abs: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const n = computeValue(obj, expr, null, options) as number;
  if (isNil(n)) return null;
  if (typeof n !== "number")
    return errExpectNumber(options.failOnError, "$abs");

  return Math.abs(n);
};
