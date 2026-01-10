import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { truncate } from "./_internal";

/**
 * Truncates a number to a whole integer or to a specified decimal place.
 *
 * @param obj
 * @param expr
 * @returns {number}
 */
export const $trunc: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const args = computeValue(obj, expr, null, options) as number[];
  return truncate(args[0], args[1], {
    name: "$trunc",
    roundOff: false,
    failOnError: options.failOnError
  });
};
