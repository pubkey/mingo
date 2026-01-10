import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import { assert, isArray, isNil, isNumber } from "../../../util";
import { errInvalidArgs } from "../_internal";

export function processBitwise(
  obj: AnyObject,
  expr: Any,
  options: Options,
  operator: string,
  compute: (n: number[]) => number
): number {
  assert(isArray(expr), `${operator} expects array as argument`);
  const nums = computeValue(obj, expr, null, options) as number[];
  if (nums.some(isNil)) return null;
  if (!nums.every(isNumber))
    return errInvalidArgs(
      options.failOnError,
      `${operator} array elements must resolve to integers`
    );
  return compute(nums);
}
