import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, HashMap, isArray } from "../../../util";
import { errExpectArray } from "../_internal";

/**
 * Returns true if two sets have the same elements.
 * @param obj
 * @param expr
 */
export const $setEquals: ExpressionOperator = (
  obj: AnyObject,
  expr: Any[],
  options: Options
): Any => {
  assert(isArray(expr), "$setEquals expects array");
  const args = computeValue(obj, expr, null, options) as Any[][];
  const foe = options.failOnError;
  // all args must be arrays (not null/undefined)
  if (!args.every(isArray)) return errExpectArray(foe, "$setEquals arguments");

  // store a unique number for each unique item. repeated values may be overriden but that's okay.
  const map = HashMap.init<Any, number>();
  args[0].every((v, i) => map.set(v, i));
  // handle arbitrary number of arrays
  for (let i = 1; i < args.length; i++) {
    const arr = args[i];
    const set = new Set<number>();
    for (let j = 0; j < arr.length; j++) {
      const n = map.get(arr[j]) ?? -1;
      if (n === -1) return false;
      set.add(n);
    }
    if (set.size !== map.size) return false;
  }
  return true;
};
