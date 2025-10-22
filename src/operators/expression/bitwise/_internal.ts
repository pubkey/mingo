import { computeValue, Options } from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, isArray, isNil, isNumber } from "../../../util";

export function processBitwise(
  obj: AnyObject,
  expr: Any,
  options: Options,
  compute: (n: number[]) => number
): number {
  assert(isArray(expr), `expression must be an array.`);
  const nums = computeValue(obj, expr, null, options) as number[];
  if (nums.some(isNil)) return null;
  assert(nums.every(isNumber), `expression must evalue to array of numbers.`);
  return compute(nums);
}
