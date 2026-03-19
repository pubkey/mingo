import { evalExpr } from "../../../core/_internal";
import { assert, isArray, isNil, isNumber } from "../../../util";
import { errInvalidArgs } from "../_internal";
function processBitwise(obj, expr, options, operator, fn) {
  assert(isArray(expr), `${operator} expects array as argument`);
  const nums = evalExpr(obj, expr, options);
  if (nums.some(isNil)) return null;
  if (!nums.every(isNumber))
    return errInvalidArgs(
      options.failOnError,
      `${operator} array elements must resolve to integers`
    );
  return fn(nums);
}
export {
  processBitwise
};
