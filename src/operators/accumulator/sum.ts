import { Any, AnyObject, Options } from "../../types";
import { isNumber } from "../../util";
import { $push } from "./push";

/**
 * Returns the sum of all the values in a group.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/sum/ usage.}
 */
export const $sum = (
  coll: AnyObject[],
  expr: Any,
  options: Options
): number => {
  // take a short cut if expr is number literal
  if (isNumber(expr)) return coll.length * expr;
  const nums = $push(coll, expr, options).filter(isNumber);
  return nums.reduce((r, n) => r + n, 0);
};
