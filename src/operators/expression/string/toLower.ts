import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray } from "../../../util/_internal";
import { $toString } from "../type";

/**
 * Converts a string to lowercase.
 */
export const $toLower: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  if (isArray(expr) && expr.length === 1) expr = expr[0];
  const s = $toString(obj, expr, options) as string;
  return s === null ? s : s.toLowerCase();
};
