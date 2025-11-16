/**

 */

import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isNil } from "../../../util";

/**
 * Evaluates an expression and returns the first non-null value.
 *
 * @param obj
 * @param expr
 * @returns {*}
 */
export const $ifNull: ExpressionOperator = (
  obj: AnyObject,
  expr: Any[],
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as Any[];
  return args.find(arg => !isNil(arg)) ?? args[args.length - 1];
};
