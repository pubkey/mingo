import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { computeDate, isoWeek } from "./_internal";

/**
 * Returns the week number in ISO 8601 format, ranging from 1 to 53.
 * Week numbers start at 1 with the week (Monday through Sunday) that contains the year's first Thursday.
 */
export const $isoWeek: ExpressionOperator<number> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  return isoWeek(computeDate(obj, expr, options));
};
