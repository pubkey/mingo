import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isNil } from "../../../util";

/**
 * Evaluates an expression and returns the first non-null value.
 */
export const $ifNull: ExpressionOperator = (
  obj: AnyObject,
  expr: Any[],
  options: Options
): Any => {
  assert(isArray(expr), "$ifNull expects an array");
  let val = undefined;
  for (const input of expr) {
    val = computeValue(obj, input, null, options);
    if (!isNil(val)) return val;
  }
  return val;
};
