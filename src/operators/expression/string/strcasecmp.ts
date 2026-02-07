import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil, isString } from "../../../util";
import { assert, simpleCmp } from "../../../util/_internal";
import { errExpectArray } from "../_internal";

/**
 * Performs case-insensitive comparison of two strings.
 */
export const $strcasecmp: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  assert(isArray(expr) && expr.length === 2, `$strcasecmp expects array(2)`);
  const args: string[] = evalExpr(obj, expr, options) as string[];
  const foe = options.failOnError;
  if (args.every(isNil)) return 0;
  if (!args.every(isString))
    return errExpectArray(foe, `$strcasecmp arguments`, { type: "string" });

  const [a, b] = args.map(s => s.toLowerCase());
  return simpleCmp(a, b);
};
