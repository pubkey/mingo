import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isArray, isNil, isString } from "../../../util";
import { errExpectArray } from "../_internal";

/**
 * Concatenates two strings.
 */
export const $concat: ExpressionOperator = (
  obj: AnyObject,
  expr: Any[],
  options: Options
): Any => {
  assert(isArray(expr), "$concat expects array");
  const foe = options.failOnError;
  const args = computeValue(obj, expr, null, options) as string[];

  let ok = true;
  for (const s of args) {
    if (isNil(s)) return null;
    ok &&= isString(s);
  }
  if (!ok) return errExpectArray(foe, "$concat", { type: "string" });

  return args.join("");
};
