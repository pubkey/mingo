import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray } from "../../../util";
import { errExpectArray } from "../_internal";

/**
 * Takes two numbers and calculates the modulo of the first number divided by the second.
 */
export const $mod: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => {
  const args = computeValue(obj, expr, null, options) as number[];
  let invalid = !isArray(args) || args.length != 2;
  invalid ||= !args.every(v => typeof v === "number");
  if (invalid)
    return errExpectArray(options.failOnError, "$mod", {
      size: 2,
      type: "number"
    });
  return args[0] % args[1];
};
