import { Any, AnyObject, Options } from "../../../types";
import { trimString } from "./_internal";

/**
 * Removes whitespace characters, including null, or the specified characters from the beginning of a string.
 */
export const $ltrim = (obj: AnyObject, expr: Any, options: Options): Any => {
  return trimString(obj, expr, options, { left: true, right: false });
};
