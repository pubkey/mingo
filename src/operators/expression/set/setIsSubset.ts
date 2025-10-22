import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, HashMap, isArray } from "../../../util";

/**
 * Takes two arrays and returns true when the first array is a subset of the second,
 * including when the first array equals the second array, and false otherwise.
 *
 * @param obj
 * @param expr
 */
export const $setIsSubset: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as Any[][];
  assert(
    isArray(args) && args.every(isArray),
    "$setIsSubset operands must be arrays."
  );
  const first = args[0];
  const second = args[1];
  const map = HashMap.init<Any, number>();
  const set = new Set<number>();

  first.every((v, i) => map.set(v, i));
  for (const v of second) {
    set.add(map.get(v) ?? -1);
    // check if we have seen all sub-items including one miss (-1)
    if (set.size > map.size) return true;
  }
  set.delete(-1);
  return set.size == map.size;
};
