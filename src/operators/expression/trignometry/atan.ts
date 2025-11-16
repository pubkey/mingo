import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { processOperator } from "./_internal";

/** Returns the inverse tangent (arc tangent) of a value in radians. */
export const $atan: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => processOperator(obj, expr, options, Math.atan);
