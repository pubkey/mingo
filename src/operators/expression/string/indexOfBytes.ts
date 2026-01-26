import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import {
  assert,
  isArray,
  isInteger,
  isNil,
  isString
} from "../../../util/_internal";
import { errExpectNumber, errExpectString } from "../_internal";

const OP = "$indexOfBytes";

/**
 * Searches a string for an occurrence of a substring and returns the UTF-8 code point index of the first occurence.
 * If the substring is not found, returns -1.
 */
export const $indexOfBytes: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  assert(isArray(expr) && expr.length > 1, `${OP} expects array(4)`);
  const args = computeValue(obj, expr, null, options) as Any[];
  const foe = options.failOnError;

  const str = args[0] as string;
  if (isNil(str)) return null;
  if (!isString(str)) return errExpectString(foe, `${OP} arg1 <string>`);

  const search = args[1] as string;
  if (!isString(search)) return errExpectString(foe, `${OP} arg2 <substring>`);

  const start = (args[2] as number) ?? 0;
  const end = (args[3] as number) ?? str.length;

  if (!isInteger(start) || start < 0)
    return errExpectNumber(foe, `${OP} arg3 <start>`, { int: true, min: 0 });
  if (!isInteger(end))
    return errExpectNumber(foe, `${OP} arg4 <end>`, { int: true, min: 0 });

  if (start > end) return -1;

  const index = str.substring(start, end).indexOf(search);
  return index > -1 ? index + start : index;
};
