import { evalExpr } from "../../../core/_internal";
import { assert, intersection, isArray, isNil } from "../../../util";
import { errExpectArray } from "../_internal";
const OP = "$setIntersection";
const $setIntersection = (obj, expr, options) => {
  assert(isArray(expr), `${OP} expects array`);
  const args = evalExpr(obj, expr, options);
  const foe = options.failOnError;
  let ok = true;
  for (const v of args) {
    if (isNil(v)) return null;
    ok &&= isArray(v);
  }
  if (!ok) return errExpectArray(foe, `${OP} arguments`);
  return intersection(args);
};
export {
  $setIntersection
};
