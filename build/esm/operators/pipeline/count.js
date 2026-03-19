import { Lazy } from "../../lazy";
import { assert, isString } from "../../util";
function $count(coll, expr, _options) {
  assert(
    isString(expr) && expr.trim().length > 0 && !expr.includes(".") && expr[0] !== "$",
    "$count expression must evaluate to valid field name"
  );
  let i = 0;
  return Lazy(() => {
    if (i++ == 0) return { value: { [expr]: coll.size() }, done: false };
    return { done: true };
  });
}
export {
  $count
};
