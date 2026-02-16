import { Any, AnyObject, Options } from "../../../types";
import { processOperator } from "./_internal";

/** Returns the sine of a value that is measured in radians. */
export const $sin = (obj: AnyObject, expr: Any, options: Options): Any =>
  processOperator(obj, expr, options, Math.sin);
