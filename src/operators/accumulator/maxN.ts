import {
  AccumulatorOperator,
  ComputeOptions,
  computeValue,
  Options
} from "../../core/_internal";
import { Any, AnyObject } from "../../types";
import { compare, isNil } from "../../util";
import { $push } from "./push";

interface InputExpr {
  n: Any;
  input: Any;
}

/**
 * Returns an aggregation of the maxmimum value n elements within a group.
 * If the group contains fewer than n elements, $maxN returns all elements in the group.
 *
 * @param {Array} collection The input array
 * @param {AnyObject} expr The right-hand side expression value of the operator
 * @param {Options} options The options to use for this operation
 * @returns {*}
 */
export const $maxN: AccumulatorOperator = (
  collection: AnyObject[],
  expr: InputExpr,
  options: Options
): Any[] => {
  const copts = options as ComputeOptions;
  const m = collection.length;
  const n = computeValue(copts?.local?.groupId, expr.n, null, copts) as number;
  const arr = $push(collection, expr.input, options).filter(o => !isNil(o));
  arr.sort((a, b) => -1 * compare(a, b));
  return m <= n ? arr : arr.slice(0, n);
};
