import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, isNil, isNumber } from "../../../util";

/**
 * Returns the largest integer less than or equal to the specified number.
 *
 * @param obj
 * @param expr
 * @returns {number}
 */
export const $floor: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const n = computeValue(obj, expr, null, options) as number;
  if (isNil(n)) return null;
  assert(
    isNumber(n) || isNaN(n),
    "$floor expression must resolve to a number."
  );
  return Math.floor(n);
};
