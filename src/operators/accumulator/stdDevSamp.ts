import { Any, AnyObject, Options } from "../../types";
import { isNumber } from "../../util";
import { stddev } from "./_internal";
import { $push } from "./push";

/**
 * Returns the sample standard deviation of the input values.
 */
export const $stdDevSamp = (
  coll: AnyObject[],
  expr: Any,
  options: Options
): number => stddev($push(coll, expr, options).filter(isNumber), true);
