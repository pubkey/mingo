import { AccumulatorOperator, Any, AnyObject, Options } from "../../types";
import { $topN } from "./topN";

/**
 * Returns the top element within a group according to the specified sort order.
 *
 * @param {Any[]} collection The input array
 * @param {AnyObject} expr The right-hand side expression value of the operator
 * @param {Options} options The options to use for this operation
 * @returns {*}
 */
export const $top: AccumulatorOperator = (
  collection: AnyObject[],
  expr: { sortBy: Record<string, number>; output: Any },
  options: Options
): Any[] => $topN(collection, { ...expr, n: 1 }, options);
