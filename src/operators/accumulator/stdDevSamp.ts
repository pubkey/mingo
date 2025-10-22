import { AccumulatorOperator, Options } from "../../core/_internal";
import { Any, AnyObject } from "../../types";
import { isNumber } from "../../util";
import { stddev } from "./_internal";
import { $push } from "./push";

/**
 * Returns the sample standard deviation of the input values.
 * @param  {Array} collection
 * @param  {AnyObject} expr
 * @return {Number|null}
 */
export const $stdDevSamp: AccumulatorOperator<number> = (
  collection: AnyObject[],
  expr: Any,
  options: Options
): number => stddev($push(collection, expr, options).filter(isNumber), true);
