import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { $ne as __ne, processExpression } from "../../_predicates";

/**
 * Matches all values that are not equal to the value specified in the query.
 */
export const $ne: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
) => processExpression(obj, expr, options, __ne);
