import { evalExpr } from "../../../core/_internal";
import { isNil } from "../../../util";
import { errExpectNumber } from "../_internal";
const $log10 = (obj, expr, options) => {
  const n = evalExpr(obj, expr, options);
  if (isNil(n)) return null;
  if (typeof n === "number") return Math.log10(n);
  return errExpectNumber(options.failOnError, "$log10");
};
export {
  $log10
};
