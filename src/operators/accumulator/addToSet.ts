import { AccumulatorOperator, Options } from "../../core/_internal";
import { Any, AnyObject } from "../../types";
import { unique } from "../../util";
import { $push } from "./push";

/**
 * Returns an array of all the unique values for the selected field among for each document in that group.
 *
 * @param {Array} collection The input array
 * @param {AnyObject} expr The right-hand side expression value of the operator
 * @param {Options} options The options to use for this operation
 * @returns {*}
 */
export const $addToSet: AccumulatorOperator = (
  collection: AnyObject[],
  expr: Any,
  options: Options
): AnyObject[] => {
  return unique(
    $push(collection, expr, options),
    options?.hashFunction
  ) as AnyObject[];
};
