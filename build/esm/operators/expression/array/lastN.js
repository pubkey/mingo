import { evalExpr } from "../../../core/_internal";
import { assert, has, isArray, isNil, isObject } from "../../../util";
import { $lastN as __lastN } from "../../accumulator/lastN";
import { errExpectArray } from "../_internal";
const $lastN = (obj, expr, options) => {
  assert(
    isObject(expr) && has(expr, "input", "n"),
    "$lastN expects object { input, n }"
  );
  if (isArray(obj)) return __lastN(obj, expr, options);
  const { input, n } = evalExpr(obj, expr, options);
  if (isNil(input)) return null;
  if (!isArray(input)) {
    return errExpectArray(options.failOnError, "$lastN 'input'");
  }
  return __lastN(input, { n, input: "$$this" }, options);
};
export {
  $lastN
};
