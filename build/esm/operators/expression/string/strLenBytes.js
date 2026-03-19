import { evalExpr } from "../../../core/_internal";
import { isString } from "../../../util";
import { errExpectString } from "../_internal";
const $strLenBytes = (obj, expr, options) => {
  const s = evalExpr(obj, expr, options);
  if (!isString(s)) return errExpectString(options.failOnError, "$strLenBytes");
  return ~-encodeURI(s).split(/%..|./).length;
};
export {
  $strLenBytes
};
