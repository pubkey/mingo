import { computeValue } from "../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../types";
import { $median as __median } from "../accumulator/median";

/**
 * Returns an approximation of the median, the 50th percentile, as a scalar value.
 */
export const $median: ExpressionOperator = (
  obj: AnyObject,
  expr: { input: Any },
  options: Options
): Any => {
  const input = computeValue(obj, expr.input, null, options) as Any[];
  return __median(input, { input: "$$CURRENT" }, options);
};
