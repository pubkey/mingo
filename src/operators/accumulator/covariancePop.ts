import { Any, AnyObject, Options } from "../../types";
import { covariance } from "./_internal";
import { $push } from "./push";

/**
 * Returns the population covariance of two numeric expressions.
 */
export const $covariancePop = (
  coll: AnyObject[],
  expr: Any,
  options: Options
) => covariance($push(coll, expr, options) as number[][], false);
