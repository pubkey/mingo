import { AccumulatorOperator, Options } from "../../core/_internal";
import { Any, AnyObject } from "../../types";
import { $bottomN } from "./bottomN";

/**
 * Returns the bottom element within a group according to the specified sort order.
 *
 * @param {Any[]} collection The input array
 * @param {AnyObject} expr The right-hand side expression value of the operator
 * @param {Options} options The options to use for this operation
 * @returns {*}
 */
export const $bottom: AccumulatorOperator = (
  collection: AnyObject[],
  expr: { sortBy: Record<string, number>; output: Any },
  options: Options
): Any[] => $bottomN(collection, { ...expr, n: 1 }, options);
