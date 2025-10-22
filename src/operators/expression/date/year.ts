import { ExpressionOperator, Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { computeDate } from "./_internal";

/**
 * Returns the year for a date as a number (e.g. 2014).
 * @param obj
 * @param expr
 */
export const $year: ExpressionOperator<number> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  return computeDate(obj, expr, options).getUTCFullYear();
};
