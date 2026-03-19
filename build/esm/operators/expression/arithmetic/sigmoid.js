import { evalExpr } from "../../../core/_internal";
import { isNil, isNumber, isObject } from "../../../util";
import { errExpectNumber } from "../_internal";
const PRECISION = 1e10;
const $sigmoid = (obj, expr, options) => {
  if (isNil(expr)) return null;
  const args = evalExpr(obj, expr, options);
  const { input, onNull } = isObject(args) ? args : { input: args };
  if (isNil(input)) return isNumber(onNull) ? onNull : null;
  if (isNumber(input)) {
    const result = 1 / (1 + Math.exp(-input));
    return Math.round(result * PRECISION) / PRECISION;
  }
  return errExpectNumber(options.failOnError, "$sigmoid");
};
export {
  $sigmoid
};
