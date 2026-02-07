import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil } from "../../../util";
import { errExpectArray } from "../_internal";

/**
 * Calculates the log of a number in the specified base and returns the result as a double.
 */
export const $log: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const args = evalExpr(obj, expr, options) as number[];

  if (isArray(args) && args.length == 2) {
    if (args.some(isNil)) return null;
    if (args.every(v => typeof v === "number"))
      return Math.log10(args[0]) / Math.log10(args[1]);
  }

  return errExpectArray(options.failOnError, "$log", {
    size: 2,
    type: "number"
  });
};
