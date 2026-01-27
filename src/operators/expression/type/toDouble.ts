import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isDate, isNil, isNumber } from "../../../util";

/**
 * Converts a value to a double. If the value cannot be converted to an double, $toDouble errors. If the value is null or missing, $toDouble returns null.
 */
export const $toDouble: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const val = computeValue(obj, expr, null, options) as
    | string
    | boolean
    | number
    | Date;

  if (isNil(val)) return null;
  if (isDate(val)) return val.getTime();
  if (val === true) return 1;
  if (val === false) return 0;

  const n = Number(val);
  assert(isNumber(n), `cannot convert '${val}' to double/decimal`);
  return n;
};
