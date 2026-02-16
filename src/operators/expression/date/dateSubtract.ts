import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { dateAdd, TimeUnit } from "./_internal";

/**
 * Decrements a Date object by a specified number of time units.
 */
export const $dateSubtract = (obj: AnyObject, expr: Any, options: Options) => {
  const args = evalExpr(obj, expr, options) as {
    startDate: Date;
    unit: TimeUnit;
    amount: number;
    timezone?: string;
  };
  return dateAdd(args.startDate, args.unit, -args.amount, args.timezone);
};
