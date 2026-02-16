import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { assert, isArray } from "../../../util";
import { truncate } from "./_internal";

/**
 * Truncates a number to a whole integer or to a specified decimal place.
 */
export const $trunc = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | null => {
  assert(isArray(expr), "$trunc expects array(2)");
  const [n, precision] = evalExpr(obj, expr, options) as number[];
  return truncate(n, precision ?? 0, {
    name: "$trunc",
    roundOff: false,
    failOnError: options.failOnError
  });
};
