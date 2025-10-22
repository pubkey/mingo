import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { isEmpty } from "../../../util";

/**
 * Converts a string to lowercase.
 *
 * @param obj
 * @param expr
 * @returns {string}
 */
export const $toLower: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const value = computeValue(obj, expr, null, options) as string;
  return isEmpty(value) ? "" : value.toLowerCase();
};
