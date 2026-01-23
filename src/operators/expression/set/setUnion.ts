import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { flatten, isArray, isNil, unique } from "../../../util";
import { errExpectArray } from "../_internal";

/**
 * Returns a set that holds all elements of the input sets.
 * @param obj
 * @param expr
 */
export const $setUnion: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as Any[];
  const foe = options.failOnError;
  if (isNil(args)) return null;
  if (!isArray(args)) return errExpectArray(foe, "$setUnion");

  if (isArray(expr)) {
    // as array operator. [ <set1>, <set2>, ... ]
    if (!args.every(isArray)) return errExpectArray(foe, "$setUnion arguments");
    return unique(flatten(args));
  }

  // use as accumulator [<item1>, <item2>, ...]
  return unique(args);
};
