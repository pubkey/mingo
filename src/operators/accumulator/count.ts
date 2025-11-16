import { AccumulatorOperator, Any, AnyObject, Options } from "../../types";

/**
 * Returns the number of documents in the group or window.
 *
 * @param {Array} collection The input array
 * @param {AnyObject} expr The right-hand side expression value of the operator
 * @returns {*}
 */
export const $count: AccumulatorOperator = (
  collection: AnyObject[],
  _expr: Any,
  _options: Options
): number => collection.length;
