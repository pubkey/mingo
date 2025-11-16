import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { regexSearch } from "./_internal";

/**
 * Applies a regular expression (regex) to a string and returns a boolean that indicates if a match is found or not.
 *
 * @param obj
 * @param expr
 */
export const $regexMatch: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  return regexSearch(obj, expr, options, { global: false }).length != 0;
};
