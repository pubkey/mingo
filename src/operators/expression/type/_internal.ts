import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { assert, isDate, isNil, isNumber, isString } from "../../../util";

export const MAX_INT = 2147483647;
export const MIN_INT = -2147483648;
export const MAX_LONG = 9007199254740991;
export const MIN_LONG = -9007199254740991;

export function toInteger(
  obj: AnyObject,
  expr: Any,
  options: Options,
  min: number,
  max: number
): number | null {
  const val = computeValue(obj, expr, null, options) as
    | string
    | number
    | boolean
    | Date;

  if (val === true) return 1;
  if (val === false) return 0;
  if (isNil(val)) return null;
  if (isDate(val)) return val.getTime();

  const n = Number(val);
  // weirdly a decimal in string format cannot be converted to int.
  // so we must check input if not string or if it is, not in decimal format
  assert(
    isNumber(n) &&
      n >= min &&
      n <= max &&
      (!isString(val) || n.toString().indexOf(".") === -1),
    `cannot convert '${val}' to ${max == MAX_INT ? "int" : "long"}`
  );
  return Math.trunc(n);
}
