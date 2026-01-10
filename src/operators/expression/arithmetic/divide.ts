import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil } from "../../../util";
import { errExpectNumberArray2, errInvalidArgs } from "../_internal";

/**
 * Takes two numbers and divides the first number by the second.
 *
 * @param obj
 * @param expr
 * @returns {number}
 */
export const $divide: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  const args = computeValue(obj, expr, null, options) as number[];

  if (isArray(args) && args.length == 2) {
    if (args.some(isNil)) return null;
    if (args.every(v => typeof v === "number")) {
      if (args[1] === 0) {
        return errInvalidArgs(
          options.failOnError,
          "$divide cannot divide by zero"
        );
      }
      return args[0] / args[1];
    }
  }

  return errExpectNumberArray2(options.failOnError, "$divide");
};
