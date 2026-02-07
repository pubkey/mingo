import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isNil, isString } from "../../../util";

/**
 * Converts a value to a boolean.
 */
export const $toBool: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): boolean | null => {
  const val = evalExpr(obj, expr, options);
  if (isNil(val)) return null;
  if (isString(val)) return true;
  return Boolean(val);
};
