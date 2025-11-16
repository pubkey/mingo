import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { processOperator } from "./_internal";

/** Returns the tangent of a value that is measured in radians. */
export const $tan: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => processOperator(obj, expr, options, Math.tan);
