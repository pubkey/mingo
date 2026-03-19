import { evalExpr } from "../../../core/_internal";
import { isInteger, isNil } from "../../../util";
import { errExpectNumber, INT_OPTS } from "../_internal";
const $bitNot = (obj, expr, options) => {
  const n = evalExpr(obj, expr, options);
  if (isNil(n)) return null;
  if (!isInteger(n))
    return errExpectNumber(options.failOnError, "$bitNot", INT_OPTS.int);
  return ~n;
};
export {
  $bitNot
};
