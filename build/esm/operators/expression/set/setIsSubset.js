import { evalExpr } from "../../../core/_internal";
import { assert, HashMap, isArray } from "../../../util";
import { errExpectArray } from "../_internal";
const OP = "$setIsSubset";
const $setIsSubset = (obj, expr, options) => {
  assert(isArray(expr) && expr.length === 2, `${OP} expects array(2)`);
  const args = evalExpr(obj, expr, options);
  if (!args.every(isArray))
    return errExpectArray(options.failOnError, `${OP} arguments`);
  const [first, second] = args;
  const map = HashMap.init();
  const set = /* @__PURE__ */ new Set();
  first.every((v, i) => map.set(v, i));
  for (const v of second) {
    set.add(map.get(v) ?? -1);
    if (set.size > map.size) return true;
  }
  set.delete(-1);
  return set.size == map.size;
};
export {
  $setIsSubset
};
