import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { processOperator } from "./_internal";

/** Returns the inverse sin (arc sine) of a value in radians. */
export const $asin: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => processOperator(obj, expr, options, Math.asin);
