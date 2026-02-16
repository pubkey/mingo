import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { ensureArray } from "../../../util";
import { errExpectArray } from "../_internal";

/**
 * Returns the boolean value that is the opposite of its argument expression. Accepts a single argument expression.
 */
export const $not = (obj: AnyObject, expr: Any, options: Options): Any => {
  const booleanExpr = ensureArray(expr);
  // array values are truthy so an emty array is false
  if (booleanExpr.length === 0) return false;
  if (booleanExpr.length > 1)
    return errExpectArray(options.failOnError, "$not", { size: 1 });
  // use provided value non-array value
  return !evalExpr(obj, booleanExpr[0], options);
};
