import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { assert, has, isArray, isNil, isObject } from "../../../util";
import { $firstN as __firstN } from "../../accumulator/firstN";
import { errExpectArray } from "../_internal";

interface InputExpr {
  n: Any;
  input: Any;
}

/**
 * Returns a specified number of elements from the beginning of an array.
 */
export const $firstN = (
  obj: AnyObject,
  expr: InputExpr,
  options: Options
): Any => {
  assert(
    isObject(expr) && has(expr, "input", "n"),
    "$firstN expects object { input, n }"
  );
  // first try the accumulator if input is an array.
  if (isArray(obj)) return __firstN(obj, expr, options);
  const { input, n } = evalExpr(obj, expr, options) as InputExpr;
  if (isNil(input)) return null;
  if (!isArray(input))
    return errExpectArray(options.failOnError, "$firstN 'input'");
  return __firstN(input as AnyObject[], { n, input: "$$this" }, options);
};
