import { evalExpr } from "../../../core/_internal";
import { assert, isArray, truthy } from "../../../util/_internal";
import { errExpectArray } from "../_internal";
const $anyElementTrue = (obj, expr, options) => {
  if (isArray(expr)) {
    if (expr.length === 0) return false;
    assert(expr.length === 1, "$anyElementTrue expects array(1)");
    expr = expr[0];
  }
  const foe = options.failOnError;
  const args = evalExpr(obj, expr, options);
  if (!isArray(args)) return errExpectArray(foe, `$anyElementTrue argument`);
  return args.some((v) => truthy(v, options.useStrictMode));
};
export {
  $anyElementTrue
};
