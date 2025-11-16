import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { computeDate, dayOfYear } from "./_internal";

/**
 * Returns the day of the year for a date as a number between 1 and 366 (leap year).
 * @param obj
 * @param expr
 */
export const $dayOfYear: ExpressionOperator<number> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  return dayOfYear(computeDate(obj, expr, options));
};
