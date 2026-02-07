import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, HashMap, isArray } from "../../../util";
import { errExpectArray } from "../_internal";

const OP = "$setIsSubset";

/**
 * Takes two arrays and returns true when the first array is a subset of the second,
 * including when the first array equals the second array, and false otherwise.
 */
export const $setIsSubset: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  assert(isArray(expr) && expr.length === 2, `${OP} expects array(2)`);
  const args = evalExpr(obj, expr, options) as Any[][];
  if (!args.every(isArray))
    return errExpectArray(options.failOnError, `${OP} arguments`);

  const [first, second] = args;
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
