import { evalExpr } from "../../../core/_internal";
import { flatten, isArray, isNil } from "../../../util";
import { $first as __first } from "../../accumulator/first";
import { errExpectArray } from "../_internal";
const $first = (obj, expr, options) => {
  if (isArray(obj)) return __first(obj, expr, options);
  const arr = evalExpr(obj, expr, options);
  if (isNil(arr)) return null;
  if (!isArray(arr)) {
    return errExpectArray(options.failOnError, "$first");
  }
  return flatten(arr)[0];
};
export {
  $first
};
