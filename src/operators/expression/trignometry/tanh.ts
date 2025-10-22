import { ExpressionOperator, Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { processOperator } from "./_internal";

/** Returns the hyperbolic tangent of a value that is measured in radians. */
export const $tanh: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any =>
  processOperator(obj, expr, options, Math.tanh, {
    Infinity: 1,
    "-Infinity": -1
  });
