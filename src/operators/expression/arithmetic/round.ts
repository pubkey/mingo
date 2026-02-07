import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray } from "../../../util";
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
  assert(isArray(expr), "$round expects array(2)");
  const [n, precision] = evalExpr(obj, expr, options) as number[];
  return truncate(n, precision ?? 0, {
    name: "$round",
    roundOff: true,
    failOnError: options.failOnError
  });
};
