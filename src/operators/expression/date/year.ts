import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { computeDate } from "./_internal";

/**
 * Returns the year for a date as a number (e.g. 2014).
 */
export const $year: ExpressionOperator<number> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  return computeDate(obj, expr, options).getUTCFullYear();
};
