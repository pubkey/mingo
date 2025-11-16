import { ComputeOptions, computeValue } from "../../core/_internal";
import { Lazy } from "../../lazy";
import { AccumulatorOperator, Any, AnyObject, Options } from "../../types";
import { $sort } from "../pipeline/sort";
import { $push } from "./push";

interface InputExpr {
  n: Any;
  sortBy: Record<string, number>;
  output: Any;
}

/**
 * Returns an aggregation of the bottom n elements within a group, according to the specified sort order.
 * If the group contains fewer than n elements, $bottomN returns all elements in the group.
 *
 * @param {Any[]} collection The input array
 * @param {AnyObject} expr The right-hand side expression value of the operator
 * @param {Options} options The options to use for this operation
 * @returns {*}
 */
export const $bottomN: AccumulatorOperator<Any[]> = (
  collection: AnyObject[],
  expr: InputExpr,
  options: Options
): Any[] => {
  const copts = options as ComputeOptions;
  const n = computeValue(copts?.local?.groupId, expr.n, null, copts) as number;
  const result = $sort(Lazy(collection), expr.sortBy, options).collect();
  const m = result.length;
  return $push(m <= n ? result : result.slice(m - n), expr.output, copts);
};
