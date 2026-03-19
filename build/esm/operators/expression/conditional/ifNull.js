import { evalExpr } from "../../../core/_internal";
import { assert, isArray, isNil } from "../../../util";
const $ifNull = (obj, expr, options) => {
  assert(isArray(expr), "$ifNull expects an array");
  let val = void 0;
  for (const input of expr) {
    val = evalExpr(obj, input, options);
    if (!isNil(val)) return val;
  }
  return val;
};
export {
  $ifNull
};
