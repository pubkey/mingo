import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, typeOf } from "../../../util";

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
  const errMsg = "$subtract: must resolve to array(2) of numbers/dates";
  assert(isArray(args) && args.length === 2, errMsg);
  const t = args.map(typeOf).join("|");
  if (t === "date|number") return new Date(+args[0] - +args[1]);
  assert(t === "date|date" || t === "number|number", errMsg);
  return +args[0] - +args[1];
};
