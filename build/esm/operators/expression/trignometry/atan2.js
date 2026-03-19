import { evalExpr } from "../../../core/_internal";
import { isNil } from "../../../util";
const $atan2 = (obj, expr, options) => {
  const [y, x] = evalExpr(obj, expr, options);
  if (isNaN(y) || isNil(y)) return y;
  if (isNaN(x) || isNil(x)) return x;
  return Math.atan2(y, x);
};
export {
  $atan2
};
