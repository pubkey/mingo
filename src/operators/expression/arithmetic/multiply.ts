import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isNil, isNumber } from "../../../util";
import { errExpectArray } from "../_internal";

/**
 * Computes the product of an array of numbers.
 *
 * @param obj
 * @param expr
 * @returns {AnyObject}
 */
export const $multiply: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  assert(isArray(expr), "$multiply expects array");
  const args = computeValue(obj, expr, null, options) as number[];
  const foe = options.failOnError;
  if (args.some(isNil)) return null;
  let res = 1;
  for (const n of args) {
    if (!isNumber(n))
      return errExpectArray(foe, "$multiply", { type: "number" });
    res *= n;
  }
  return res;
};
