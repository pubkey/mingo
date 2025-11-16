import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { $gte as __gte, processExpression } from "../../_predicates";

/**
 * Matches values that are greater than or equal to a specified value.
 */
export const $gte: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
) => processExpression(obj, expr, options, __gte);
