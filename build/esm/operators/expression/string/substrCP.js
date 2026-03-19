import { evalExpr } from "../../../core/_internal";
import { assert, isArray, isInteger, isNil, isString } from "../../../util";
import { errExpectNumber, errExpectString } from "../_internal";
const OP = "$substrCP";
const $substrCP = (obj, expr, options) => {
  assert(isArray(expr) && expr.length === 3, `${OP} expects array(3)`);
  const [s, index, count] = evalExpr(obj, expr, options);
  const nil = isNil(s);
  const foe = options.failOnError;
  if (!nil && !isString(s)) return errExpectString(foe, `${OP} arg1 <string>`);
  if (!isInteger(index)) return errExpectNumber(foe, `${OP} arg2 <index>`);
  if (!isInteger(count)) return errExpectNumber(foe, `${OP} arg3 <count>`);
  if (nil) return "";
  if (index < 0) return "";
  if (count < 0) return s.substring(index);
  return s.substring(index, index + count);
};
export {
  $substrCP
};
