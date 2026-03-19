import { evalExpr } from "../../../core/_internal";
import { assert, has, isArray, isNil, isObject } from "../../../util";
import { $firstN as __firstN } from "../../accumulator/firstN";
import { errExpectArray } from "../_internal";
const $firstN = (obj, expr, options) => {
  assert(
    isObject(expr) && has(expr, "input", "n"),
    "$firstN expects object { input, n }"
  );
  if (isArray(obj)) return __firstN(obj, expr, options);
  const { input, n } = evalExpr(obj, expr, options);
  if (isNil(input)) return null;
  if (!isArray(input))
    return errExpectArray(options.failOnError, "$firstN 'input'");
  return __firstN(input, { n, input: "$$this" }, options);
};
export {
  $firstN
};
