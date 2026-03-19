import { evalExpr } from "../../../core/_internal";
import { isNil, isString } from "../../../util";
const $toBool = (obj, expr, options) => {
  const val = evalExpr(obj, expr, options);
  if (isNil(val)) return null;
  if (isString(val)) return true;
  return Boolean(val);
};
export {
  $toBool
};
