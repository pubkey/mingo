import { ExpressionOperator, Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { MAX_LONG, MIN_LONG, toInteger } from "./_internal";

/**
 * Converts a value to a long. If the value cannot be converted to a long, $toLong errors. If the value is null or missing, $toLong returns null.
 * @param obj
 * @param expr
 */
export const $toLong: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => toInteger(obj, expr, options, MIN_LONG, MAX_LONG);
