import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { processOperator } from "./_internal";

/** Returns the inverse cosine (arc cosine) of a value in radians. */
export const $acos: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any =>
  processOperator(obj, expr, options, Math.acos, {
    Infinity: Infinity,
    0: new Error()
  });
