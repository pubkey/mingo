import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { isNumber } from "../../../util";

/**
 * Checks if the specified expression resolves to a numeric value
 */
export const $isNumber = (
  obj: AnyObject,
  expr: Any,
  options: Options
): boolean | null => {
  const n = evalExpr(obj, expr, options);
  return isNumber(n);
};
