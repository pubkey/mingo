import { evalExpr } from "../../../core/_internal";
import { assert, HashMap, isArray } from "../../../util";
import { errExpectArray } from "../_internal";
const $setEquals = (obj, expr, options) => {
  assert(isArray(expr), "$setEquals expects array");
  const args = evalExpr(obj, expr, options);
  const foe = options.failOnError;
  if (!args.every(isArray)) return errExpectArray(foe, "$setEquals arguments");
  const map = HashMap.init();
  args[0].every((v, i) => map.set(v, i));
  for (let i = 1; i < args.length; i++) {
    const arr = args[i];
    const set = /* @__PURE__ */ new Set();
    for (let j = 0; j < arr.length; j++) {
      const n = map.get(arr[j]) ?? -1;
      if (n === -1) return false;
      set.add(n);
    }
    if (set.size !== map.size) return false;
  }
  return true;
};
export {
  $setEquals
};
