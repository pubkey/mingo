import { evalExpr } from "../../../core/_internal";
import { assert, isObject, truthy } from "../../../util/_internal";
const $switch = (obj, expr, options) => {
  assert(isObject(expr), "$switch received invalid arguments");
  for (const { case: caseExpr, then } of expr.branches) {
    const condition = truthy(
      evalExpr(obj, caseExpr, options),
      options.useStrictMode
    );
    if (condition) return evalExpr(obj, then, options);
  }
  return evalExpr(obj, expr.default, options);
};
export {
  $switch
};
