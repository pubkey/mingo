import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isEqual } from "../../../util";
import { errInvalidArgs } from "../_internal";

const err = "$in must resolve to [<expression>, <array>]";

/**
 * Returns a boolean indicating whether a specified value is in an array.
 *
 * @param {AnyObject} obj
 * @param {Any[]} expr
 */
export const $in: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): boolean => {
  assert(isArray(expr) && expr.length == 2, "$in expects array(2)");
  const args = computeValue(obj, expr, null, options) as [Any, Any[]];
  const [item, arr] = args;
  if (!isArray(arr)) return errInvalidArgs(options.failOnError, err);
  return arr.some(v => isEqual(v, item));
};
