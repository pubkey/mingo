import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isNil, isString } from "../../../util";

/**
 * Concatenates two strings.
 *
 * @param obj
 * @param expr
 * @returns {string|*}
 */
export const $concat: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as string[];
  assert(
    args.every(v => isString(v) || isNil(v)),
    "$concat only supports strings."
  );
  if (args.some(isNil)) return null;
  return args.join("");
};
