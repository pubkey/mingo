import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { isEmpty } from "../../../util";

/**
 * Converts a string to uppercase.
 *
 * @param obj
 * @param expr
 * @returns {string}
 */
export const $toUpper: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const value = computeValue(obj, expr, null, options) as string;
  return isEmpty(value) ? "" : value.toUpperCase();
};
