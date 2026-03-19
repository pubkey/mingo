import { evalExpr } from "../../../core/_internal";
import {
  assert,
  isArray,
  isInteger,
  isNil,
  isString
} from "../../../util/_internal";
import { errExpectNumber, errExpectString, INT_OPTS } from "../_internal";
const OP = "$indexOfBytes";
const $indexOfBytes = (obj, expr, options) => {
  assert(
    isArray(expr) && expr.length > 1 && expr.length < 5,
    `${OP} expects array(4)`
  );
  const args = evalExpr(obj, expr, options);
  const foe = options.failOnError;
  const str = args[0];
  if (isNil(str)) return null;
  if (!isString(str)) return errExpectString(foe, `${OP} arg1 <string>`);
  const search = args[1];
  if (!isString(search)) return errExpectString(foe, `${OP} arg2 <search>`);
  const start = args[2] ?? 0;
  const end = args[3] ?? str.length;
  if (!isInteger(start) || start < 0)
    return errExpectNumber(foe, `${OP} arg3 <start>`, INT_OPTS.index);
  if (!isInteger(end) || end < 0)
    return errExpectNumber(foe, `${OP} arg4 <end>`, INT_OPTS.index);
  if (start > end) return -1;
  const index = str.substring(start, end).indexOf(search);
  return index > -1 ? index + start : index;
};
export {
  $indexOfBytes
};
