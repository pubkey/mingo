import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil } from "../../../util";
import { errExpectArray } from "../_internal";

/**
 * Concatenates arrays to return the concatenated array.
 *
 * @param  obj
 * @param  expr
 * @param options
 */
export const $concatArrays: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as Any[][];
  if (isNil(args)) return null;

  if (!isArray(args)) {
    return errExpectArray(options.failOnError, "$concatArrays");
  }

  let size = 0;
  for (const arr of args) {
    if (isNil(arr)) return null;
    if (!isArray(arr)) {
      return errExpectArray(options.failOnError, "$concatArrays");
    }
    size += arr.length;
  }
  const result = new Array(size);
  let i = 0;
  for (const arr of args) for (const item of arr) result[i++] = item;
  return result;
};
