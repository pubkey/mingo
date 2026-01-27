import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { computeDate } from "./_internal";

/**
 * Returns the hour for a date as a number between 0 and 23.
 */
export const $hour: ExpressionOperator<number> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  return computeDate(obj, expr, options).getUTCHours();
};
