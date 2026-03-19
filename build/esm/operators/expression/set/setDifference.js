import { evalExpr } from "../../../core/_internal";
import { assert, HashMap, isArray, isNil } from "../../../util";
import { errExpectArray } from "../_internal";
const OP = "$setDifference";
const $setDifference = (obj, expr, options) => {
  assert(isArray(expr) && expr.length == 2, `${OP} expects array(2)`);
  const args = evalExpr(obj, expr, options);
  const foe = options.failOnError;
  let ok = true;
  for (const v of args) {
    if (isNil(v)) return null;
    ok &&= isArray(v);
  }
  if (!ok) return errExpectArray(foe, `${OP} arguments`);
  const m = HashMap.init();
  args[0].forEach((v) => m.set(v, true));
  args[1].forEach((v) => m.delete(v));
  return Array.from(m.keys());
};
export {
  $setDifference
};
