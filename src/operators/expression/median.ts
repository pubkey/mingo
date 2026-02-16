import { evalExpr } from "../../core/_internal";
import { Any, AnyObject, Options } from "../../types";
import { $median as __median } from "../accumulator/median";

/**
 * Returns an approximation of the median, the 50th percentile, as a scalar value.
 */
export const $median = (
  obj: AnyObject,
  expr: { input: Any; method: "approximate" | "exact" },
  options: Options
): Any => {
  const input = evalExpr(obj, expr.input, options) as Any[];
  return __median(input, { input: "$$CURRENT", method: expr.method }, options);
};
