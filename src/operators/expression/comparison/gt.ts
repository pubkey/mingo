import { Any, AnyObject, Options } from "../../../types";
import { $gt as __gt, processExpression } from "../../_predicates";

/**
 * Matches values that are greater than a specified value.
 */
export const $gt = (obj: AnyObject, expr: Any, options: Options) =>
  processExpression(obj, expr, options, __gt);
