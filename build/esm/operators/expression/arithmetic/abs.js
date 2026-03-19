import { evalExpr } from "../../../core/_internal";
import { isNil } from "../../../util";
import { errExpectNumber } from "../_internal";
const $abs = (obj, expr, options) => {
  const n = evalExpr(obj, expr, options);
  if (isNil(n)) return null;
  if (typeof n !== "number")
    return errExpectNumber(options.failOnError, "$abs");
  return Math.abs(n);
};
export {
  $abs
};
