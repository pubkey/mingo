import { evalExpr } from "../../../core/_internal";
import { assert, isArray, truthy } from "../../../util/_internal";
const $or = (obj, expr, options) => {
  assert(isArray(expr), "$or expects array of expressions");
  const strict = options.useStrictMode;
  return expr.some((v) => truthy(evalExpr(obj, v, options), strict));
};
export {
  $or
};
