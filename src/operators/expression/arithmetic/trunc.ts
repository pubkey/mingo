import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isNil, isNumber } from "../../../util";
import { truncate } from "./_internal";

/**
 * Truncates a number to a whole integer or to a specified decimal place.
 *
 * @param obj
 * @param expr
 * @returns {number}
 */
export const $trunc: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const arr = computeValue(obj, expr, null, options) as Any[];
  const num = arr[0] as number;
  const places = arr[1] as number;
  if (isNil(num) || isNaN(num) || Math.abs(num) === Infinity) return num;
  assert(isNumber(num), "$trunc expression must resolve to a number.");
  assert(
    isNil(places) || (isNumber(places) && places > -20 && places < 100),
    "$trunc expression has invalid place"
  );
  return truncate(num, places, false);
};
