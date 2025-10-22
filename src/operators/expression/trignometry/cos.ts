import { ExpressionOperator, Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { processOperator } from "./_internal";

/** Returns the cosine of a value that is measured in radians. */
export const $cos: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => processOperator(obj, expr, options, Math.cos);
