import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { isNil } from "../../../util";
import { errExpectNumber } from "../_internal";

/**
 * Returns the smallest integer greater than or equal to the specified number.
 */
export const $ceil = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const n = evalExpr(obj, expr, options) as number;
  if (isNil(n)) return null;
  if (typeof n !== "number")
    return errExpectNumber(options.failOnError, "$ceil");
  return Math.ceil(n);
};
