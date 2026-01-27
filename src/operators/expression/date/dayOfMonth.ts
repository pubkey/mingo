import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { computeDate } from "./_internal";

/**
 * Returns the day of the month for a date as a number between 1 and 31.
 */
export const $dayOfMonth: ExpressionOperator<number> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  return computeDate(obj, expr, options).getUTCDate();
};
