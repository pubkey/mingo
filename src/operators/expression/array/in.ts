import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isEqual } from "../../../util";

/**
 * Returns a boolean indicating whether a specified value is in an array.
 *
 * @param {AnyObject} obj
 * @param {Any[]} expr
 */
export const $in: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): boolean => {
  const [item, arr] = computeValue(obj, expr, null, options) as [Any, Any[]];
  assert(isArray(arr), "$in second argument must be an array");
  return arr.some(v => isEqual(v, item));
};
