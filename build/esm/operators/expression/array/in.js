import { evalExpr } from "../../../core/_internal";
import { assert, isArray, isEqual } from "../../../util";
import { errInvalidArgs } from "../_internal";
const $in = (obj, expr, options) => {
  assert(isArray(expr) && expr.length === 2, "$in expects array(2)");
  const args = evalExpr(obj, expr, options);
  const [item, arr] = args;
  if (!isArray(arr))
    return errInvalidArgs(options.failOnError, "$in arg2 <array>");
  return arr.some((v) => isEqual(v, item));
};
export {
  $in
};
