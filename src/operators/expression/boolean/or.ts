import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { assert, isArray, truthy } from "../../../util/_internal";

/**
 * Returns true when any of its expressions evaluates to true. Accepts any number of argument expressions.
 */
export const $or = (obj: AnyObject, expr: Any[], options: Options): Any => {
  assert(isArray(expr), "$or expects array of expressions");
  const strict = options.useStrictMode;
  for (const v of expr)
    if (truthy(evalExpr(obj, v, options), strict)) return true;
  return false;
};
