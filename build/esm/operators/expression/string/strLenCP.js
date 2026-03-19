import { evalExpr } from "../../../core/_internal";
import { isString } from "../../../util";
import { errExpectString } from "../_internal";
const $strLenCP = (obj, expr, options) => {
  const s = evalExpr(obj, expr, options);
  if (!isString(s)) return errExpectString(options.failOnError, "$strLenCP");
  return s.length;
};
export {
  $strLenCP
};
