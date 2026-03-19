import { evalExpr } from "../../../core/_internal";
import {
  assert,
  isArray,
  isEqual,
  isInteger,
  isNil
} from "../../../util/_internal";
import { errExpectArray, errExpectNumber, INT_OPTS } from "../_internal";
const OP = "$indexOfArray";
const $indexOfArray = (obj, expr, options) => {
  assert(
    isArray(expr) && expr.length > 1 && expr.length < 5,
    `${OP} expects array(4)`
  );
  const args = evalExpr(obj, expr, options);
  const foe = options.failOnError;
  const arr = args[0];
  if (isNil(arr)) return null;
  if (!isArray(arr)) return errExpectArray(foe, `${OP} arg1 <array>`);
  const search = args[1];
  const start = args[2] ?? 0;
  const end = args[3] ?? arr.length;
  if (!isInteger(start) || start < 0)
    return errExpectNumber(foe, `${OP} arg3 <start>`, INT_OPTS.pos);
  if (!isInteger(end) || end < 0)
    return errExpectNumber(foe, `${OP} arg4 <end>`, INT_OPTS.pos);
  if (start > end) return -1;
  const input = start > 0 || end < arr.length ? arr.slice(start, end) : arr;
  return input.findIndex((v) => isEqual(v, search)) + start;
};
export {
  $indexOfArray
};
