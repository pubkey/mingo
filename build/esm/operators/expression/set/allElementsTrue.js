import { evalExpr } from "../../../core/_internal";
import { assert, isArray, truthy } from "../../../util/_internal";
import { errExpectArray } from "../_internal";
const $allElementsTrue = (obj, expr, options) => {
  if (isArray(expr)) {
    if (expr.length === 0) return true;
    assert(expr.length === 1, "$allElementsTrue expects array(1)");
    expr = expr[0];
  }
  const foe = options.failOnError;
  const args = evalExpr(obj, expr, options);
  if (!isArray(args)) return errExpectArray(foe, `$allElementsTrue argument`);
  return args.every((v) => truthy(v, options.useStrictMode));
};
export {
  $allElementsTrue
};
