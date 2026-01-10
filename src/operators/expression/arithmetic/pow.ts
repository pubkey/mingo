import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isNil } from "../../../util";
import { errExpectNumberArray2 } from "../_internal";

/**
 * Raises a number to the specified exponent and returns the result.
 *
 * @param obj
 * @param expr
 * @returns {AnyObject}
 */
export const $pow: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  const args = computeValue(obj, expr, null, options) as number[];
  const skip = !options.failOnError;
  if (isArray(args) && args.length == 2) {
    if (args.some(isNil)) return null;
    if (args.every(v => typeof v === "number")) {
      const [a, b] = args;
      if (a === 0 && b < 0) {
        assert(skip, "$pow cannot raise 0 to a negative exponent");
        return null;
      }
      return Math.pow(a, b);
    }
  }
  return errExpectNumberArray2(options.failOnError, "$pow");
};
