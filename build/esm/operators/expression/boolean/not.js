import { evalExpr } from "../../../core/_internal";
import { ensureArray } from "../../../util";
import { errExpectArray } from "../_internal";
const $not = (obj, expr, options) => {
  const booleanExpr = ensureArray(expr);
  if (booleanExpr.length === 0) return false;
  if (booleanExpr.length > 1)
    return errExpectArray(options.failOnError, "$not", { size: 1 });
  return !evalExpr(obj, booleanExpr[0], options);
};
export {
  $not
};
