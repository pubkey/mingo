import { ComputeOptions, computeValue } from "../../core/_internal";
import { AccumulatorOperator, Any, AnyObject, Options } from "../../types";

/**
 * Returns the first value in a group.
 *
 * @param collection The input array
 * @param expr The right-hand side expression value of the operator
 * @returns {*}
 */
export const $first: AccumulatorOperator = (
  collection: AnyObject[],
  expr: Any,
  options: Options
): Any => {
  const obj = collection[0];
  const copts = ComputeOptions.init(options).update({ root: obj });
  return computeValue(obj, expr, null, copts) ?? null;
};
