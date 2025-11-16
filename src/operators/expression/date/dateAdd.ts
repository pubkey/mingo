import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { dateAdd, TimeUnit } from "./_internal";

/**
 * Increments a Date object by a specified number of time units.
 * @param obj
 * @param expr
 */
export const $dateAdd: ExpressionOperator<Date> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Date => {
  const args = computeValue(obj, expr, null, options) as {
    startDate: Date;
    unit: TimeUnit;
    amount: number;
    timezone?: string;
  };
  return dateAdd(args.startDate, args.unit, args.amount, args.timezone);
};
