import { evalExpr } from "../../../core/_internal";
import { assert, isArray, truthy } from "../../../util/_internal";
const $and = (obj, expr, options) => {
  assert(isArray(expr), "$and expects array");
  const mode = options.useStrictMode;
  return expr.every((e) => truthy(evalExpr(obj, e, options), mode));
};
export {
  $and
};
