import { Any, AnyObject, Options } from "../../types";
import { isNumber } from "../../util";
import { stddev } from "./_internal";
import { $push } from "./push";

/**
 * Returns the population standard deviation of the input values.
 */
export const $stdDevPop = (
  coll: AnyObject[],
  expr: Any,
  options: Options
): number => stddev($push(coll, expr, options).filter(isNumber), false);
