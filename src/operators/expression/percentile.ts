import { computeValue } from "../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../types";
import { $percentile as __percentile } from "../accumulator/percentile";

/**
 * Returns an array of scalar values that correspond to specified percentile values.
 *
 * @param obj The current object
 * @param expr The operator expression
 * @param options Options to use for processing
 * @returns {Any[]<number>}
 */
export const $percentile: ExpressionOperator<number[]> = (
  obj: AnyObject,
  expr: { input: Any; p: Any[]; method: "approximate" },
  options: Options
): number[] => {
  const input = computeValue(obj, expr.input, null, options) as number[];
  return __percentile(input, { ...expr, input: "$$CURRENT" }, options);
};
