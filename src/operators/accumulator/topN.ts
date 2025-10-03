import {
  AccumulatorOperator,
  ComputeOptions,
  computeValue,
  Options
} from "../../core";
import { Lazy } from "../../lazy";
import { Any, AnyObject } from "../../types";
import { $sort } from "../pipeline/sort";
import { $push } from "./push";

interface InputExpr {
  n: number;
  sortBy: Record<string, number>;
  output: Any;
}

/**
 * Returns an aggregation of the top n elements within a group, according to the specified sort order.
 * If the group contains fewer than n elements, $topN returns all elements in the group.
 *
 * @param {Any[]} collection The input array
 * @param {AnyObject} expr The right-hand side expression value of the operator
 * @param {Options} options The options to use for this operation
 * @returns {*}
 */
export const $topN: AccumulatorOperator<Any[]> = (
  collection: AnyObject[],
  expr: InputExpr,
  options: Options
): Any[] => {
  const copts = options as ComputeOptions;
  const { n, sortBy } = computeValue(
    copts?.local?.groupId,
    expr,
    null,
    copts
  ) as Pick<InputExpr, "n" | "sortBy">;

  const result = $sort(Lazy(collection), sortBy, options).take(n).value();
  return $push(result, expr.output, copts);
};
