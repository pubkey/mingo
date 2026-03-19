import { evalExpr } from "../../core/_internal";
import { assert, isObject } from "../../util";
function $replaceRoot(coll, expr, options) {
  return coll.map((obj) => {
    obj = evalExpr(obj, expr.newRoot, options);
    assert(isObject(obj), "$replaceRoot expression must return an object");
    return obj;
  });
}
export {
  $replaceRoot
};
