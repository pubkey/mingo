import { ExpressionOperator, Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { $eq as __eq, processExpression } from "../../_predicates";

/**
 * Matches values that are equal to a specified value.
 */
export const $eq: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
) => processExpression(obj, expr, options, __eq);
