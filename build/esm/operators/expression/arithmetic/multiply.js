import { evalExpr } from "../../../core/_internal";
import { assert, isArray, isNil, isNumber } from "../../../util";
import { errExpectArray } from "../_internal";
const $multiply = (obj, expr, options) => {
  assert(isArray(expr), "$multiply expects array");
  const args = evalExpr(obj, expr, options);
  const foe = options.failOnError;
  if (args.some(isNil)) return null;
  let res = 1;
  for (const n of args) {
    if (!isNumber(n))
      return errExpectArray(foe, "$multiply", { type: "number" });
    res *= n;
  }
  return res;
};
export {
  $multiply
};
