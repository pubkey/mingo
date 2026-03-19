import { evalExpr } from "../../../core/_internal";
import { isArray, isNil } from "../../../util";
import { errExpectArray } from "../_internal";
const $reverseArray = (obj, expr, options) => {
  const arr = evalExpr(obj, expr, options);
  if (isNil(arr)) return null;
  if (!isArray(arr))
    return errExpectArray(options.failOnError, "$reverseArray");
  return arr.slice().reverse();
};
export {
  $reverseArray
};
