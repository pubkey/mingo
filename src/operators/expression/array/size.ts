import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil } from "../../../util";
import { errExpectNumber } from "../_internal";

/**
 * Counts and returns the total the number of items in an array.
 *
 * @param obj
 * @param expr
 */
export const $size: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const value = computeValue(obj, expr, null, options) as Any[];
  if (isNil(value)) return null;
  return isArray(value)
    ? value.length
    : errExpectNumber(options.failOnError, "$size");
};
