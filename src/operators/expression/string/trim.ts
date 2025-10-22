import { ExpressionOperator, Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { trimString } from "./_internal";

/**
 * Removes whitespace characters, including null, or the specified characters from the beginning and end of a string.
 *
 * @param obj
 * @param expr
 */
export const $trim: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  return trimString(obj, expr, options, { left: true, right: true });
};
