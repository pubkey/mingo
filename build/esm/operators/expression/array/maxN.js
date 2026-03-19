import { evalExpr } from "../../../core/_internal";
import { assert, has, isArray, isNil, isObject } from "../../../util";
import { $maxN as __maxN } from "../../accumulator/maxN";
import { errExpectArray } from "../_internal";
const $maxN = (obj, expr, options) => {
  assert(
    isObject(expr) && has(expr, "input", "n"),
    "$maxN expects object { input, n }"
  );
  if (isArray(obj)) return __maxN(obj, expr, options);
  const { input, n } = evalExpr(obj, expr, options);
  if (isNil(input)) return null;
  if (!isArray(input))
    return errExpectArray(options.failOnError, "$maxN 'input'");
  return __maxN(input, { n, input: "$$this" }, options);
};
export {
  $maxN
};
