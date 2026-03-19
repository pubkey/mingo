import { evalExpr } from "../../../core/_internal";
import { assert, isArray, isNil, isString } from "../../../util";
import { errExpectArray } from "../_internal";
const $concat = (obj, expr, options) => {
  assert(isArray(expr), "$concat expects array");
  const foe = options.failOnError;
  const args = evalExpr(obj, expr, options);
  let ok = true;
  for (const s of args) {
    if (isNil(s)) return null;
    ok &&= isString(s);
  }
  if (!ok) return errExpectArray(foe, "$concat", { type: "string" });
  return args.join("");
};
export {
  $concat
};
