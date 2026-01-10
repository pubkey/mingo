import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil, isNumber } from "../../../util";
import { errInvalidArgs } from "../_internal";

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
  if (args.some(isNil)) return null;

  const [arr, index] = args as [Any[], number];
  if (!(isArray(arr) && isNumber(index))) {
    return errInvalidArgs(
      options.failOnError,
      "$arrayElemAt expects [<array>, <index>]"
    );
  }

  if (index < 0 && Math.abs(index) <= arr.length) {
    return arr[(index + arr.length) % arr.length];
  } else if (index >= 0 && index < arr.length) {
    return arr[index];
  }
  return undefined;
};
