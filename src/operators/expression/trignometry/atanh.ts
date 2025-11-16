import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { processOperator } from "./_internal";

/** Returns the inverse hyperbolic tangent (hyperbolic arc tangent) of a value in radians. */
export const $atanh: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any =>
  processOperator(obj, expr, options, Math.atanh, {
    1: Infinity,
    "-1": -Infinity
  });
