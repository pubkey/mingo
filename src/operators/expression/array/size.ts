import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { isArray, isNil } from "../../../util";
import { errExpectNumber } from "../_internal";

/**
 * Counts and returns the total the number of items in an array.
 */
export const $size = (obj: AnyObject, expr: Any, options: Options): Any => {
  const value = evalExpr(obj, expr, options) as Any[];
  if (isNil(value)) return null;
  return isArray(value)
    ? value.length
    : errExpectNumber(options.failOnError, "$size");
};
