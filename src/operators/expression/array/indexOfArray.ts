import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isEqual, isNil, isNumber } from "../../../util";
import { errExpectArray, errInvalidArgs } from "../_internal";

/**
 * Searches an array for an occurrence of a specified value and returns the array index of the first occurrence.
 * If the substring is not found, returns -1.
 *
 * @param  {AnyObject} obj
 * @param  {*} expr
 * @return {*}
 */
export const $indexOfArray: ExpressionOperator = (
  obj: AnyObject,
  expr: Any[],
  options: Options
): number => {
  assert(
    isArray(expr),
    "$indexOfArray expects [ <array>, <search>, <start>?, <end>? ]"
  );
  const args = computeValue(obj, expr, null, options) as Any[];

  const arr = args[0] as Any[];
  if (isNil(arr)) return null;
  if (!isArray(arr))
    return errExpectArray(options.failOnError, "$indexOfArray first argument");

  const search = args[1];
  const start = (args[2] ?? 0) as number;
  const end = (args[3] ?? arr.length) as number;

  if (!isNumber(start) || !isNumber(end) || start < 0 || end < 0) {
    return errInvalidArgs(
      options.failOnError,
      "$indexOfArray must resolve <start> and <end> to positive numbers"
    );
  }

  if (start > end) return -1;
  const input = start > 0 || end < arr.length ? arr.slice(start, end) : arr;

  return input.findIndex((v: Any) => isEqual(v, search)) + start;
};
