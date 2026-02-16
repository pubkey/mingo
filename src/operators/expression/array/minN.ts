import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { assert, has, isArray, isNil, isObject } from "../../../util";
import { $minN as __minN } from "../../accumulator/minN";
import { errExpectArray } from "../_internal";

interface InputExpr {
  n: Any;
  input: Any;
}

/**
 * Returns the n smallest values in an array.
 */
export const $minN = (
  obj: AnyObject,
  expr: InputExpr,
  options: Options
): Any => {
  assert(
    isObject(expr) && has(expr, "input", "n"),
    "$minN expects object { input, n }"
  );
  // first try the accumulator if input is an array.
  if (isArray(obj)) return __minN(obj, expr, options);
  const { input, n } = evalExpr(obj, expr, options) as InputExpr;
  if (isNil(input)) return null;
  if (!isArray(input))
    return errExpectArray(options.failOnError, "$minN 'input'");
  return __minN(input as AnyObject[], { n, input: "$$this" }, options);
};
