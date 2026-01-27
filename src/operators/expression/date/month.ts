import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { computeDate } from "./_internal";

/**
 * Returns the month for a date as a number between 1 (January) and 12 (December).
 */
export const $month: ExpressionOperator<number> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  return computeDate(obj, expr, options).getUTCMonth() + 1;
};
