import { ExpressionOperator, Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { $nin as __nin, processExpression } from "../../_predicates";

/**
 * Returns a boolean indicating whether a specified value is not an array.
 * Note: This expression operator is missing from the documentation
 *
 * @param {Object} obj
 * @param {Array} expr
 */
export const $nin: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
) => processExpression(obj, expr, options, __nin);
