import { evalExpr } from "../../../core/_internal";
import { assert, has, isArray, isNil, isObject } from "../../../util";
import { $minN as __minN } from "../../accumulator/minN";
import { errExpectArray } from "../_internal";
const $minN = (obj, expr, options) => {
  assert(
    isObject(expr) && has(expr, "input", "n"),
    "$minN expects object { input, n }"
  );
  if (isArray(obj)) return __minN(obj, expr, options);
  const { input, n } = evalExpr(obj, expr, options);
  if (isNil(input)) return null;
  if (!isArray(input))
    return errExpectArray(options.failOnError, "$minN 'input'");
  return __minN(input, { n, input: "$$this" }, options);
};
export {
  $minN
};
