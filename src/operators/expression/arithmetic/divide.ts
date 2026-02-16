import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { assert, isArray, isNil, isNumber } from "../../../util";
import { errExpectArray, errInvalidArgs } from "../_internal";

/**
 * Takes two numbers and divides the first number by the second.
 */
export const $divide = (obj: AnyObject, expr: Any, options: Options) => {
  assert(isArray(expr), "$divide expects array(2)");
  const args = evalExpr(obj, expr, options) as number[];
  const foe = options.failOnError;

  if (args.some(isNil)) return null;
  if (!args.every(isNumber)) {
    return errExpectArray(foe, "$divide", {
      size: 2,
      type: "number"
    });
  }
  const [a, b] = args;
  if (b === 0) return errInvalidArgs(foe, "$divide cannot divide by zero");
  return a / b;
};
