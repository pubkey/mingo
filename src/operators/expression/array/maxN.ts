import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, has, isArray, isNil, isObject } from "../../../util";
import { $maxN as __maxN } from "../../accumulator/maxN";
import { errExpectArray } from "../_internal";

interface InputExpr {
  n: Any;
  input: Any;
}

/**
 * Returns the n largest values in an array.
 */
export const $maxN: ExpressionOperator = (
  obj: AnyObject,
  expr: InputExpr,
  options: Options
): Any => {
  assert(
    isObject(expr) && has(expr, "input", "n"),
    "$maxN expects object { input, n }"
  );
  // first try the accumulator if input is an array.
  if (isArray(obj)) return __maxN(obj, expr, options);
  const { input, n } = evalExpr(obj, expr, options) as InputExpr;
  if (isNil(input)) return null;
  if (!isArray(input))
    return errExpectArray(options.failOnError, "$maxN 'input'");
  return __maxN(input as AnyObject[], { n, input: "$$this" }, options);
};
