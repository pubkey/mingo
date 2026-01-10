import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isDate, isNil, isNumber } from "../../../util";

/**
 * Takes an array that contains two numbers or two dates and subtracts the second value from the first.
 *
 * @param obj
 * @param expr
 * @param options
 * @returns {number}
 */
export const $subtract: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as (number | Date)[];
  let err = "$subtract must resolve to array(2) of numbers/dates";
  if (isArray(args) && args.length === 2) {
    if (args.some(isNil)) return null;
    const [a, b] = args;
    if (isDate(a) && isNumber(b)) return new Date(+a - b);
    if (isDate(a) && isDate(b)) return +a - +b;
    if (args.every(v => typeof v === "number"))
      return (a as number) - (b as number);
    if (isNumber(a) && isDate(b))
      err = "$subtract cannot subtract date from number";
  }
  assert(!options.failOnError, err);
  return null;
};
