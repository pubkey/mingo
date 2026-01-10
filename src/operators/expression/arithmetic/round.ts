import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { truncate } from "./_internal";

/**
 * Rounds a number to to a whole integer or to a specified decimal place.
 * @param {*} obj
 * @param {*} expr
 */
export const $round: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  const args = computeValue(obj, expr, null, options) as number[];
  return truncate(args[0], args[1], {
    name: "$round",
    roundOff: true,
    failOnError: options.failOnError
  });
};
