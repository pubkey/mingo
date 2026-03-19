import { evalExpr } from "../../../core/_internal";
import { assert, compare, isArray } from "../../../util";
const $cmp = (obj, expr, options) => {
  assert(isArray(expr) && expr.length === 2, "$cmp expects array(2)");
  const [a, b] = evalExpr(obj, expr, options);
  return compare(a, b);
};
export {
  $cmp
};
