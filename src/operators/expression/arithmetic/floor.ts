import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isNil } from "../../../util";
import { errExpectNumber } from "../_internal";

/**
 * Returns the largest integer less than or equal to the specified number.
 */
export const $floor: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const n = computeValue(obj, expr, null, options) as number;
  if (isNil(n)) return null;
  if (typeof n !== "number") {
    return errExpectNumber(options.failOnError, "$floor");
  }
  return Math.floor(n);
};
