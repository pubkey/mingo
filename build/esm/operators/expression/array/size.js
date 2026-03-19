import { evalExpr } from "../../../core/_internal";
import { isArray, isNil } from "../../../util";
import { errExpectNumber } from "../_internal";
const $size = (obj, expr, options) => {
  const value = evalExpr(obj, expr, options);
  if (isNil(value)) return null;
  return isArray(value) ? value.length : errExpectNumber(options.failOnError, "$size");
};
export {
  $size
};
