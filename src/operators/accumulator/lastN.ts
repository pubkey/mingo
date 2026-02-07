import { ComputeOptions, evalExpr } from "../../core/_internal";
import { AccumulatorOperator, Any, AnyObject, Options } from "../../types";
import { isInteger } from "../../util";
import { errExpectNumber, INT_OPTS } from "../expression/_internal";
import { $push } from "./push";

interface InputExpr {
  n: Any;
  input: Any;
}

/**
 * Returns an aggregation of the last n elements within a group. The elements returned are meaningful only if in a specified sort order.
 * If the group contains fewer than n elements, $lastN returns all elements in the group.
 *
 * @param {Array} collection The input array
 * @param {AnyObject} expr The right-hand side expression value of the operator
 * @param {Options} options The options to use for this operation
 * @returns {*}
 */
export const $lastN: AccumulatorOperator = (
  collection: AnyObject[],
  expr: InputExpr,
  options: Options
): Any[] => {
  const copts = options as ComputeOptions;
  const m = collection.length;
  const n = evalExpr(copts?.local?.groupId, expr.n, copts) as number;
  const foe = options.failOnError;
  if (!isInteger(n) || n < 1) {
    return errExpectNumber(foe, "$lastN 'n'", INT_OPTS.pos);
  }
  return $push(
    m <= n ? collection : collection.slice(m - n),
    expr.input,
    options
  );
};
