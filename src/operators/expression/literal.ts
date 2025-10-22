import { ExpressionOperator, Options } from "../../core/_internal";
import { Any, AnyObject } from "../../types";

/**
 * Return a value without parsing.
 * @param obj
 * @param expr
 * @param options
 */
export const $literal: ExpressionOperator = (
  _obj: AnyObject,
  expr: Any,
  _options: Options
): Any => expr;
