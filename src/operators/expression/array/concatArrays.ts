import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isNil } from "../../../util";

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
  const nArray = computeValue(obj, expr, null, options) as Any[][];
  assert(isArray(nArray), "$concatArrays: input must resolve to an array");

  let size = 0;
  for (const arr of nArray) {
    if (isNil(arr)) return null;
    size += arr.length;
  }
  const result = new Array(size);
  let i = 0;
  for (const arr of nArray) for (const item of arr) result[i++] = item;
  return result;
};
