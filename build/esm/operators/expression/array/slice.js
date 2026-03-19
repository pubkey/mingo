import { evalExpr } from "../../../core/_internal";
import { assert, isArray, isInteger, isNil } from "../../../util";
import { errExpectArray, errExpectNumber, INT_OPTS } from "../_internal";
const $slice = (obj, expr, options) => {
  assert(
    isArray(expr) && expr.length > 1 && expr.length < 4,
    "$slice expects array(3)"
  );
  const foe = options.failOnError;
  const args = evalExpr(obj, expr, options);
  const arr = args[0];
  let skip = args[1];
  let limit = args[2];
  if (!isArray(arr)) return errExpectArray(foe, "$slice arg1 <array>");
  if (!isInteger(skip))
    return errExpectNumber(foe, "$slice arg2 <n>", INT_OPTS.int);
  if (!isNil(limit) && !isInteger(limit))
    return errExpectNumber(foe, "$slice arg3 <n>", INT_OPTS.int);
  if (isNil(limit)) {
    if (skip < 0) {
      skip = Math.max(0, arr.length + skip);
    } else {
      limit = skip;
      skip = 0;
    }
  } else {
    if (skip < 0) {
      skip = Math.max(0, arr.length + skip);
    }
    if (limit < 1) {
      return errExpectNumber(foe, "$slice arg3 <n>", INT_OPTS.pos);
    }
    limit += skip;
  }
  return arr.slice(skip, limit);
};
export {
  $slice
};
