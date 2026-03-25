import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { assert, isArray, isInteger, isNil } from "../../../util";
import { errInvalidArgs } from "../_internal";

export function processBitwise(
  obj: AnyObject,
  expr: Any,
  options: Options,
  operator: string,
  fn: (n: number[]) => number
) {
  assert(isArray(expr), `${operator} expects array as argument`);
  const nums = evalExpr(obj, expr, options) as number[];
  let t_num = true;
  for (const v of nums) {
    if (isNil(v)) return null;
    t_num &&= isInteger(v);
  }

  if (t_num) return fn(nums);

  return errInvalidArgs(
    options.failOnError,
    `${operator} array elements must resolve to integers`
  );
}
