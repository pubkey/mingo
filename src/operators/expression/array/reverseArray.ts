import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isNil } from "../../../util";

/**
 * Returns an array with the elements in reverse order.
 *
 * @param  {AnyObject} obj
 * @param  {*} expr
 * @return {*}
 */
export const $reverseArray: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const arr = computeValue(obj, expr, null, options) as Any[];

  if (isNil(arr)) return null;
  assert(isArray(arr), "$reverseArray expression must resolve to an array");

  const result = arr.slice(0);
  result.reverse();
  return result;
};
