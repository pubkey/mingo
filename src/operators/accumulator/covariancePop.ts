import { AccumulatorOperator, Options } from "../../core/_internal";
import { Any, AnyObject } from "../../types";
import { covariance } from "./_internal";
import { $push } from "./push";

/**
 * Returns the population covariance of two numeric expressions.
 * @param  {Array} collection
 * @param  {AnyObject} expr
 * @return {Number|null}
 */
export const $covariancePop: AccumulatorOperator = (
  collection: AnyObject[],
  expr: Any,
  options: Options
): number => covariance($push(collection, expr, options) as number[][], false);
