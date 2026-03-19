import { evalExpr } from "../../../core/_internal";
import { isArray, isNil } from "../../../util";
import { errExpectArray } from "../_internal";
const $concatArrays = (obj, expr, options) => {
  const args = evalExpr(obj, expr, options);
  const foe = options.failOnError;
  if (isNil(args)) return null;
  if (!isArray(args)) return errExpectArray(foe, "$concatArrays");
  let size = 0;
  for (const arr of args) {
    if (isNil(arr)) return null;
    if (!isArray(arr)) return errExpectArray(foe, "$concatArrays");
    size += arr.length;
  }
  const result = new Array(size);
  let i = 0;
  for (const arr of args) for (const item of arr) result[i++] = item;
  return result;
};
export {
  $concatArrays
};
