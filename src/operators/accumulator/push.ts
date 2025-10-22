import {
  AccumulatorOperator,
  ComputeOptions,
  computeValue,
  Options
} from "../../core/_internal";
import { Any } from "../../types";
import { isNil } from "../../util";

/**
 * Returns an array of all values for the selected field among for each document in that group.
 *
 * @param {Any[]} collection The input array
 * @param {Object} expr The right-hand side expression value of the operator
 * @param {Options} options The options to use for this operation
 * @returns {Any[]|*}
 */
export const $push: AccumulatorOperator<Any[]> = (
  collection: Any[],
  expr: Any,
  options: Options
): Any[] => {
  if (isNil(expr)) return collection;
  const copts = ComputeOptions.init(options);
  return collection.map(obj =>
    computeValue(obj, expr, null, copts.update({ root: obj }))
  );
};
