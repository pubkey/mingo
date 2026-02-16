import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { assert, isArray, isNil, isString } from "../../../util";
import { errExpectArray } from "../_internal";

/**
 * Concatenates two strings.
 */
export const $concat = (obj: AnyObject, expr: Any[], options: Options): Any => {
  assert(isArray(expr), "$concat expects array");
  const foe = options.failOnError;
  const args = evalExpr(obj, expr, options) as string[];

  let ok = true;
  for (const s of args) {
    if (isNil(s)) return null;
    ok &&= isString(s);
  }
  if (!ok) return errExpectArray(foe, "$concat", { type: "string" });

  return args.join("");
};
