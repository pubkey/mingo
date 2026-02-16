import { Any, AnyObject, Options } from "../../../types";
import { isArray } from "../../../util/_internal";
import { $toString } from "../type";

/**
 * Converts a string to lowercase.
 */
export const $toLower = (obj: AnyObject, expr: Any, options: Options): Any => {
  if (isArray(expr) && expr.length === 1) expr = expr[0];
  const s = $toString(obj, expr, options);
  return s === null ? s : s.toLowerCase();
};
