import { AccumulatorOperator, Any, AnyObject, Options } from "../../types";
import { isNumber } from "../../util";
import { stddev } from "./_internal";
import { $push } from "./push";

/**
 * Returns the population standard deviation of the input values.
 *
 * @param {Array} collection The input array
 * @param {AnyObject} expr The right-hand side expression value of the operator
 * @param {Options} options The options to use for this operation
 * @return {Number}
 */
export const $stdDevPop: AccumulatorOperator = (
  collection: AnyObject[],
  expr: Any,
  options: Options
): number => stddev($push(collection, expr, options).filter(isNumber), false);
