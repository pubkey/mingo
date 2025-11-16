import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isString } from "../../../util";

/**
 * Returns a substring of a string, starting at a specified index position and including the specified number of characters.
 * The index is zero-based.
 *
 * @param obj
 * @param expr
 * @returns {string}
 */
export const $substr: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const [s, start, count] = computeValue(obj, expr, null, options) as [
    string,
    number,
    number
  ];
  if (start < 0 || !isString(s)) return "";
  if (count < 0) return s.substring(start);
  return s.substring(start, start + count);
};
