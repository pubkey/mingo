import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isNil, isNumber } from "../../../util";
import { errExpectNumber } from "../_internal";

/**
 * Returns the result of a bitwise not operation on a single argument or an array that contains a single int or long value.
 *
 * @param obj Document from collection
 * @param expr Right hand side expression of operator
 * @returns {Number}
 */
export const $bitNot: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const n = computeValue(obj, expr, null, options) as number;
  if (isNil(n)) return null;
  if (!isNumber(n)) return errExpectNumber(options.failOnError, "$bitNot");
  return ~n;
};
