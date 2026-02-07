import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, HashMap, isArray, isNil } from "../../../util";
import { errExpectArray } from "../_internal";

const OP = "$setDifference";

/**
 * Returns elements of a set that do not appear in a second set.
 */
export const $setDifference: ExpressionOperator = (
  obj: AnyObject,
  expr: Any[],
  options: Options
): Any => {
  assert(isArray(expr) && expr.length == 2, `${OP} expects array(2)`);
  const args = evalExpr(obj, expr, options) as [Any[], Any[]];
  const foe = options.failOnError;

  let ok = true;
  for (const v of args) {
    if (isNil(v)) return null;
    ok &&= isArray(v);
  }
  if (!ok) return errExpectArray(foe, `${OP} arguments`);
  const m = HashMap.init();
  args[0].forEach(v => m.set(v, true));
  args[1].forEach(v => m.delete(v));
  return Array.from(m.keys());
};
