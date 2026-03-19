import { evalExpr } from "../../core/_internal";
import { assert, isObject } from "../../util";
function $replaceWith(coll, expr, options) {
  return coll.map((obj) => {
    obj = evalExpr(obj, expr, options);
    assert(isObject(obj), "$replaceWith expression must return an object");
    return obj;
  });
}
export {
  $replaceWith
};
