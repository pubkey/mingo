import { Any, AnyObject, Options } from "../../../types";
import { isArray } from "../../../util";
import { regexSearch } from "./_internal";

/**
 * Applies a regular expression (regex) to a string and returns information on the first matched substring.
 */
export const $regexFind = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const result = regexSearch(obj, expr, options, { global: false });
  return isArray(result) && result.length > 0 ? result[0] : null;
};
