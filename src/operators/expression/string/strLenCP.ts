import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";

/**
 * Returns the number of UTF-8 code points in the specified string.
 *
 * @param  {AnyObject} obj
 * @param  {String} expr
 * @return {Number}
 */
export const $strLenCP: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  return (computeValue(obj, expr, null, options) as Any[]).length;
};
