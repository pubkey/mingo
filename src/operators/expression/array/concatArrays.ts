import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil } from "../../../util";
import { errExpectArray } from "../_internal";

/**
 * Concatenates arrays to return the concatenated array.
 */
export const $concatArrays: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as Any[][];
  const foe = options.failOnError;

  if (isNil(args)) return null;
  if (!isArray(args)) return errExpectArray(foe, "$concatArrays");

  let size = 0;
  for (const arr of args) {
    if (isNil(arr)) return null;
    if (!isArray(arr)) return errExpectArray(foe, "$concatArrays");
    size += arr.length;
  }
  const result = new Array(size);
  let i = 0;
  for (const arr of args) for (const item of arr) result[i++] = item;
  return result;
};
