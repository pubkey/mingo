import { evalExpr } from "../../../core/_internal";
import { assert, isArray, isNil, isNumber } from "../../../util";
import { errExpectArray, errInvalidArgs } from "../_internal";
const $pow = (obj, expr, options) => {
  assert(isArray(expr) && expr.length === 2, "$pow expects array(2)");
  const args = evalExpr(obj, expr, options);
  const foe = options.failOnError;
  if (args.some(isNil)) return null;
  if (!args.every(isNumber)) {
    return errExpectArray(foe, "$pow", {
      size: 2,
      type: "number"
    });
  }
  const [n, exponent] = args;
  return n === 0 && exponent < 0 ? errInvalidArgs(foe, "$pow cannot raise 0 to a negative exponent") : Math.pow(n, exponent);
};
export {
  $pow
};
