import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isDate, isNil } from "../../../util";

/**
 * Converts a value to a date. If the value cannot be converted to a date, $toDate errors. If the value is null or missing, $toDate returns null.
 *
 * @param obj
 * @param expr
 */
export const $toDate: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Date | null => {
  const val = computeValue(obj, expr, null, options) as string | number | Date;

  if (isDate(val)) return val;
  if (isNil(val)) return null;

  const d = new Date(val);
  assert(!isNaN(d.getTime()), `cannot convert '${val}' to date`);
  return d;
};
