import { ExpressionOperator, Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { processOperator } from "./_internal";

/** Returns the hyperbolic sine of a value that is measured in radians. */
export const $sinh: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any =>
  processOperator(obj, expr, options, Math.sinh, {
    "-Infinity": -Infinity,
    Infinity: Infinity
  });
