import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isString } from "../../../util";
import { errExpectString } from "../_internal";

/**
 * Returns the number of UTF-8 code points in the specified string.
 */
export const $strLenCP: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const s = computeValue(obj, expr, null, options) as string;
  if (!isString(s)) return errExpectString(options.failOnError, "$strLenCP");
  return s.length;
};
