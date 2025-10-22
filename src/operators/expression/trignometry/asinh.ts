import { ExpressionOperator, Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { processOperator } from "./_internal";

/** Returns the inverse hyperbolic sine (hyperbolic arc sine) of a value in radians. */
export const $asinh: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any =>
  processOperator(obj, expr, options, Math.asinh, {
    Infinity: Infinity,
    "-Infinity": -Infinity
  });
