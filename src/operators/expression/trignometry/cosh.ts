import { Any, AnyObject, Options } from "../../../types";
import { processOperator } from "./_internal";

/** Returns the hyperbolic cosine of a value that is measured in radians. */
export const $cosh = (obj: AnyObject, expr: Any, options: Options): Any =>
  processOperator(obj, expr, options, Math.cosh, {
    "-Infinity": Infinity,
    Infinity: Infinity
  });
