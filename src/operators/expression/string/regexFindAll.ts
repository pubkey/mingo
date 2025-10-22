import { ExpressionOperator, Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { regexSearch } from "./_internal";

/**
 * Applies a regular expression (regex) to a string and returns information on the all matched substrings.
 *
 * @param obj
 * @param expr
 */
export const $regexFindAll: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  return regexSearch(obj, expr, options, { global: true });
};
