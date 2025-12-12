import { computeValue } from "../../../core/_internal";
import { Lazy } from "../../../lazy";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, compare, isArray, isNil, isObject } from "../../../util";
import { $sort } from "../../pipeline/sort";

/**
 * Sorts an array based on its elements. The sort order is user specified.
 *
 * @param obj The target object
 * @param expr The expression argument
 * @param options Options
 * @returns
 */
export const $sortArray: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const { input, sortBy } = computeValue(obj, expr, null, options) as {
    input: Any[];
    sortBy: AnyObject | number;
  };

  if (isNil(input)) return null;
  assert(isArray(input), "$sortArray expression must resolve to an array");

  if (isObject(sortBy)) {
    return $sort(Lazy(input), sortBy, options).collect();
  }

  const result = input.slice();
  result.sort(compare);
  if (sortBy === -1) result.reverse();
  return result;
};
