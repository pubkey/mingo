import { computeValue } from "../../../core/_internal";
import { AnyObject, ExpressionOperator, Options } from "../../../types";
import { $dateAdd } from "./dateAdd";

/**
 * Decrements a Date object by a specified number of time units.
 */
export const $dateSubtract: ExpressionOperator<Date> = (
  obj: AnyObject,
  expr: AnyObject,
  options: Options
): Date => {
  const amount = computeValue(obj, expr?.amount, null, options) as number;
  return $dateAdd(obj, { ...expr, amount: -1 * amount }, options);
};
