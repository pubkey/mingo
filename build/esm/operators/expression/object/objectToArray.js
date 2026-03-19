import { evalExpr } from "../../../core/_internal";
import { isNil, isObject } from "../../../util";
import { errExpectObject } from "../_internal";
const $objectToArray = (obj, expr, options) => {
  const val = evalExpr(obj, expr, options);
  if (isNil(val)) return null;
  if (!isObject(val))
    return errExpectObject(options.failOnError, "$objectToArray");
  const entries = Object.entries(val);
  const result = new Array(entries.length);
  let i = 0;
  for (const [k, v] of entries) {
    result[i++] = { k, v };
  }
  return result;
};
export {
  $objectToArray
};
