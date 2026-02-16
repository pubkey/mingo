import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { isNil } from "../../../util";
import { errExpectNumber } from "../_internal";

/**
 * Raises Euler’s number (i.e. e ) to the specified exponent and returns the result.
 */
export const $exp = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const n = evalExpr(obj, expr, options) as number;
  if (isNil(n)) return null;
  if (typeof n !== "number") {
    return errExpectNumber(options.failOnError, "$exp");
  }
  return Math.exp(n);
};
