import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { processOperator } from "./_internal";

const radiansToDegrees = (n: number) => n * (180 / Math.PI);

/** Converts a value from radians to degrees. */
export const $radiansToDegrees: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any =>
  processOperator(obj, expr, options, radiansToDegrees, {
    Infinity: Infinity,
    "-Infinity": Infinity
  });
