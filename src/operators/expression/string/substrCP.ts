import { computeValue } from "../../../core";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isNil, isNumber, isString } from "../../../util";
import { errExpectNumber, errExpectString } from "../_internal";

const OP = "$substrCP";

/** Returns the substring of a string by UTF-8 code point index (zero-based).  */
export const $substrCP: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  assert(isArray(expr) && expr.length === 3, `${OP} expects array(3)`);
  const [s, index, count] = computeValue(obj, expr, null, options) as [
    string,
    number,
    number
  ];

  const nil = isNil(s);
  const foe = options.failOnError;
  if (!nil && !isString(s)) return errExpectString(foe, `${OP} arg1 <string>`);
  if (!isNumber(index)) return errExpectNumber(foe, `${OP} arg2 <index>`);
  if (!isNumber(count)) return errExpectNumber(foe, `${OP} arg3 <count>`);
  // If the argument resolves to a value of null or refers to a field that is missing, return an empty string.
  if (nil) return "";
  if (index < 0) return "";
  if (count < 0) return s.substring(index);
  return s.substring(index, index + count);
};
