import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isNil } from "../../../util";
import { errExpectNumber } from "../_internal";

/**
 * Calculates the natural logarithm ln (i.e loge) of a number and returns the result as a double.
 */
export const $ln: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const n = evalExpr(obj, expr, options) as number;
  if (isNil(n)) return null;
  if (typeof n !== "number") {
    return errExpectNumber(options.failOnError, "$ln");
  }
  return Math.log(n);
};
