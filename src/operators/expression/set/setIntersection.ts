import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, intersection, isArray, isNil } from "../../../util";

/**
 * Returns the common elements of the input sets.
 * @param obj
 * @param expr
 */
export const $setIntersection: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as Any[][];
  if (isNil(args)) return null;
  assert(
    isArray(args) && args.every(isArray),
    "$setIntersection operands must be arrays."
  );
  return intersection(args, options?.hashFunction);
};
