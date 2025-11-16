import type { ComputeOptions } from "../../core/_internal";
import { computeValue } from "../../core/_internal";
import { AccumulatorOperator, Any, AnyObject, Options } from "../../types";
import { assert } from "../../util";
import { $push } from "./push";

interface InputExpr {
  n: Any;
  input: Any;
}

/**
 * Returns an aggregation of the first n elements within a group. The elements returned are meaningful only if in a specified sort order.
 * If the group contains fewer than n elements, $firstN returns all elements in the group.
 *
 * @param {Array} collection The input array
 * @param {AnyObject} expr The right-hand side expression value of the operator
 * @param {Options} options The options to use for this operation
 * @returns {*}
 */
export const $firstN: AccumulatorOperator = (
  collection: AnyObject[],
  expr: InputExpr,
  options: Options
): Any[] => {
  const copts = options as ComputeOptions;
  const m = collection.length;
  const n = computeValue(copts?.local?.groupId, expr.n, null, copts) as number;
  assert(n > 0, "$firstN: 'n' must resolve to a positive integer.");
  return $push(
    m <= n ? collection : collection.slice(0, n),
    expr.input,
    options
  );
};
