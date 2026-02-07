import { ComputeOptions, evalExpr } from "../../core/_internal";
import { Lazy } from "../../lazy";
import { AccumulatorOperator, Any, AnyObject, Options } from "../../types";
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
 */
export const $topN: AccumulatorOperator<Any[]> = (
  collection: AnyObject[],
  expr: InputExpr,
  options: Options
): Any[] => {
  const copts = options as ComputeOptions;
  const { n, sortBy } = evalExpr(copts?.local?.groupId, expr, copts) as Pick<
    InputExpr,
    "n" | "sortBy"
  >;

  const result = $sort(Lazy(collection), sortBy, options).take(n).collect();
  return $push(result, expr.output, copts);
};
