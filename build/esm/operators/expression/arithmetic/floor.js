import { evalExpr } from "../../../core/_internal";
import { isNil } from "../../../util";
import { errExpectNumber } from "../_internal";
const $floor = (obj, expr, options) => {
  const n = evalExpr(obj, expr, options);
  if (isNil(n)) return null;
  if (typeof n !== "number") {
    return errExpectNumber(options.failOnError, "$floor");
  }
  return Math.floor(n);
};
export {
  $floor
};
