import { assert } from "../../util";
function $skip(coll, expr, _options) {
  assert(expr >= 0, "$skip value must be a non-negative integer");
  return coll.drop(expr);
}
export {
  $skip
};
