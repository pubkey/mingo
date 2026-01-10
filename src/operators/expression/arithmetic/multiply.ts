import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isNil } from "../../../util";

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
  const args = computeValue(obj, expr, null, options) as number[];
  const skip = !options.failOnError;
  if (!isArray(args) || !args.every(v => typeof v === "number" || isNil(v))) {
    assert(skip, "$multiply expression must resolve to array of numbers");
    return null;
  }
  if (args.some(isNil)) return null;
  return args.reduce((acc, num) => acc * num, 1);
};
