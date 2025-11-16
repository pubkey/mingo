import { AccumulatorOperator, Any, AnyObject, Options } from "../../types";
import { covariance } from "./_internal";
import { $push } from "./push";

/**
 * Returns the sample covariance of two numeric expressions.
 * @param  {Array} collection
 * @param  {AnyObject} expr
 * @return {Number|null}
 */
export const $covarianceSamp: AccumulatorOperator = (
  collection: AnyObject[],
  expr: Any,
  options: Options
): number => covariance($push(collection, expr, options) as number[][], true);
