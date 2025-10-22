import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, HashMap, isArray, isNil } from "../../../util";

/**
 * Returns elements of a set that do not appear in a second set.
 * @param obj
 * @param expr
 */
export const $setDifference: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as [Any[], Any[]];
  if (isNil(args)) return null;

  assert(isArray(args), "$setDifference must be an arrays.");
  if (args.some(isNil)) return null;

  assert(args.length == 2, `$setDifference takes exactly 2 arguments.`);
  assert(args.every(isArray), "$setDifference operands must be arrays.");

  const m = HashMap.init(options.hashFunction);
  args[0].forEach(v => m.set(v, true));
  args[1].forEach(v => m.delete(v));
  return Array.from(m.keys());
};
