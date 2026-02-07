import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, has, isArray, isNil, isObject } from "../../../util";
import { $lastN as __lastN } from "../../accumulator/lastN";
import { errExpectArray } from "../_internal";

interface InputExpr {
  n: Any;
  input: Any;
}

/**
 * Returns a specified number of elements from the end of an array.
 */
export const $lastN: ExpressionOperator = (
  obj: AnyObject,
  expr: InputExpr,
  options: Options
): Any => {
  assert(
    isObject(expr) && has(expr, "input", "n"),
    "$lastN expects object { input, n }"
  );
  // first try the accumulator if input is an array.
  if (isArray(obj)) return __lastN(obj, expr, options);
  const { input, n } = evalExpr(obj, expr, options) as InputExpr;
  if (isNil(input)) return null;
  if (!isArray(input)) {
    return errExpectArray(options.failOnError, "$lastN 'input'");
  }
  return __lastN(input as AnyObject[], { n, input: "$$this" }, options);
};
