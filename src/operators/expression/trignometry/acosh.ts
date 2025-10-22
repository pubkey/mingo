import { ExpressionOperator, Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { processOperator } from "./_internal";

/** Returns the inverse hyperbolic cosine (hyperbolic arc cosine) of a value in radians. */
export const $acosh: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any =>
  processOperator(obj, expr, options, Math.acosh, {
    Infinity: Infinity,
    0: new Error()
  });
