import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, isArray, isNil } from "../../../util";

/**
 * Returns the element at the specified array index.
 *
 * @param  {AnyObject} obj
 * @param  {*} expr
 * @return {*}
 */
export const $arrayElemAt: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as Any[];
  assert(
    isArray(args) && args.length === 2,
    "$arrayElemAt expression must resolve to array(2)"
  );

  if (args.some(isNil)) return null;

  const index = args[1] as number;
  const arr = args[0] as Any[];
  if (index < 0 && Math.abs(index) <= arr.length) {
    return arr[(index + arr.length) % arr.length];
  } else if (index >= 0 && index < arr.length) {
    return arr[index];
  }
  return undefined;
};
