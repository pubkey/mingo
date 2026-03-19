import { evalExpr } from "../../../core/_internal";
import { isNumber } from "../../../util";
const $isNumber = (obj, expr, options) => {
  const n = evalExpr(obj, expr, options);
  return isNumber(n);
};
export {
  $isNumber
};
