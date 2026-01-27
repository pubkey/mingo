import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isInteger, isNil } from "../../../util";
import { errExpectNumber, INT_OPTS } from "../_internal";

/**
 * Returns the result of a bitwise not operation on a single argument or an array that contains a single int or long value.
 */
export const $bitNot: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const n = computeValue(obj, expr, null, options) as number;
  if (isNil(n)) return null;
  if (!isInteger(n))
    return errExpectNumber(options.failOnError, "$bitNot", INT_OPTS.int);
  return ~n;
};
