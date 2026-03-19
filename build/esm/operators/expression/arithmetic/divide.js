import { evalExpr } from "../../../core/_internal";
import { assert, isArray, isNil, isNumber } from "../../../util";
import { errExpectArray, errInvalidArgs } from "../_internal";
const $divide = (obj, expr, options) => {
  assert(isArray(expr), "$divide expects array(2)");
  const args = evalExpr(obj, expr, options);
  const foe = options.failOnError;
  if (args.some(isNil)) return null;
  if (!args.every(isNumber)) {
    return errExpectArray(foe, "$divide", {
      size: 2,
      type: "number"
    });
  }
  const [a, b] = args;
  if (b === 0) return errInvalidArgs(foe, "$divide cannot divide by zero");
  return a / b;
};
export {
  $divide
};
