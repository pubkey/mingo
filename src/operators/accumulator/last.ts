import {
  AccumulatorOperator,
  ComputeOptions,
  computeValue,
  Options
} from "../../core/_internal";
import { Any, AnyObject } from "../../types";

/**
 * Returns the last value in the collection.
 *
 * @param collection The input array
 * @param expr The right-hand side expression value of the operator
 * @param options The options to use for this operation
 * @returns
 */
export const $last: AccumulatorOperator = (
  collection: AnyObject[],
  expr: Any,
  options: Options
): Any => {
  if (collection.length === 0) return undefined;
  const obj = collection[collection.length - 1];
  const copts = ComputeOptions.init(options).update({ root: obj });
  return computeValue(obj, expr, null, copts);
};
