import { evalExpr } from "../../../core/_internal";
import { truthy } from "../../../util/_internal";
function $expr(_, expr, options) {
  return (obj) => truthy(evalExpr(obj, expr, options), options.useStrictMode);
}
export {
  $expr
};
