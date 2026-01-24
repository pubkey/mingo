import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isNil, isNumber } from "../../../util";
import { errExpectArray, errInvalidArgs } from "../_internal";

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
  assert(isArray(expr) && expr.length === 2, "$pow expects array(2)");
  const args = computeValue(obj, expr, null, options) as number[];
  const foe = options.failOnError;

  if (args.some(isNil)) return null;
  if (!args.every(isNumber)) {
    return errExpectArray(foe, "$pow", {
      size: 2,
      type: "number"
    });
  }

  const [n, exponent] = args;

  return n === 0 && exponent < 0
    ? errInvalidArgs(foe, "$pow cannot raise 0 to a negative exponent")
    : Math.pow(n, exponent);
};
