import { evalExpr } from "../../../core/_internal";
import { assert, isNil } from "../../../util";
const $sqrt = (obj, expr, options) => {
  const n = evalExpr(obj, expr, options);
  const skip = !options.failOnError;
  if (isNil(n)) return null;
  if (typeof n !== "number" || n < 0) {
    assert(skip, "$sqrt expression must resolve to non-negative number.");
    return null;
  }
  return Math.sqrt(n);
};
export {
  $sqrt
};
