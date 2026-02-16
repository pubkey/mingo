import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { assert, isArray, truthy } from "../../../util/_internal";
import { errExpectArray } from "../_internal";

/**
 * Returns true if all elements of a set evaluate to true, and false otherwise.
 */
export const $allElementsTrue = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  // accepts array or expression
  if (isArray(expr)) {
    if (expr.length === 0) return true;
    assert(expr.length === 1, "$allElementsTrue expects array(1)");
    expr = expr[0];
  }
  const foe = options.failOnError;
  const args = evalExpr(obj, expr, options) as Any[];
  if (!isArray(args)) return errExpectArray(foe, `$allElementsTrue argument`);
  return args.every(v => truthy(v, options.useStrictMode));
};
