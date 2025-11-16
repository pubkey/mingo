import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isDate } from "../../../util";

/**
 * Computes the sum of an array of numbers.
 *
 * @param obj
 * @param expr
 * @param options
 */
export const $add: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | Date => {
  const args = computeValue(obj, expr, null, options) as Any[];
  let hasDate = false;
  let sum = 0;
  for (const n of args) {
    if (isDate(n)) {
      assert(!hasDate, "'$add' can only have one date value");
      hasDate = true;
    }
    sum += +n;
  }
  return hasDate ? new Date(sum) : sum;
};
