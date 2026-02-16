import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { assert, isArray, truthy } from "../../../util/_internal";

/**
 * Returns true only when all its expressions evaluate to true. Accepts any number of argument expressions.
 */
export const $and = (obj: AnyObject, expr: Any[], options: Options): Any => {
  assert(isArray(expr), "$and expects array");
  const mode = options.useStrictMode;
  return expr.every(e => truthy(evalExpr(obj, e, options), mode));
};
