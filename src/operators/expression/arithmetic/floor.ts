import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { isNil } from "../../../util";
import { errExpectNumber } from "../_internal";

/**
 * Returns the largest integer less than or equal to the specified number.
 */
export const $floor = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const n = evalExpr(obj, expr, options) as number;
  if (isNil(n)) return null;
  if (typeof n !== "number") {
    return errExpectNumber(options.failOnError, "$floor");
  }
  return Math.floor(n);
};
