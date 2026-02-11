import { evalExpr } from "../../../core/_internal";
import { AnyObject, Options } from "../../../types";
import { $dateAdd } from "./dateAdd";

/**
 * Decrements a Date object by a specified number of time units.
 */
export function $dateSubtract(
  obj: AnyObject,
  expr: AnyObject,
  options: Options
): Date {
  const amount = evalExpr(obj, expr?.amount, options) as number;
  return $dateAdd(obj, { ...expr, amount: -1 * amount }, options);
}
