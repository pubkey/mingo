import { evalExpr } from "../../../core/_internal";
import { assert, isArray } from "../../../util";
const $isArray = (obj, expr, options) => {
  let input = expr;
  if (isArray(expr)) {
    assert(expr.length === 1, "$isArray expects array(1)");
    input = expr[0];
  }
  return isArray(evalExpr(obj, input, options));
};
export {
  $isArray
};
