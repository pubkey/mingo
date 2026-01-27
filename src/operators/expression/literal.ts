import { Any, AnyObject, ExpressionOperator, Options } from "../../types";

/**
 * Return a value without parsing.
 */
export const $literal: ExpressionOperator = (
  _obj: AnyObject,
  expr: Any,
  _options: Options
): Any => expr;
