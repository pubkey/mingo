import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, isArray, isBoolean, isNil } from "../../../util";

/**
 * Merge two lists together.
 *
 * Transposes an array of input arrays so that the first element of the output array would be an array containing,
 * the first element of the first input array, the first element of the second input array, etc.
 *
 * @param  {Obj} obj
 * @param  {*} expr
 * @return {*}
 */
export const $zip: ExpressionOperator = (
  obj: AnyObject,
  expr: { inputs: Any[]; useLongestLength: boolean; defaults: Any },
  options: Options
): Any => {
  const inputs = computeValue(obj, expr.inputs, null, options) as Any[][];
  const useLongestLength = expr.useLongestLength || false;

  if (isNil(inputs)) return null;

  assert(isArray(inputs), "'inputs' expression must resolve to an array");
  assert(isBoolean(useLongestLength), "'useLongestLength' must be a boolean");

  if (isArray(expr.defaults)) {
    assert(
      useLongestLength,
      "'useLongestLength' must be set to true to use 'defaults'"
    );
  }

  let zipCount = 0;

  for (const arr of inputs) {
    if (isNil(arr)) return null;

    assert(
      isArray(arr),
      "'inputs' expression values must resolve to an array or null"
    );

    zipCount = useLongestLength
      ? Math.max(zipCount, arr.length)
      : Math.min(zipCount || arr.length, arr.length);
  }

  const result: Any[] = [];
  const defaults = expr.defaults || [];

  for (let i = 0; i < zipCount; i++) {
    const temp = inputs.map((val: Any[], index: number) => {
      return isNil(val[i]) ? (defaults[index] as Any) || null : val[i];
    });
    result.push(temp);
  }

  return result;
};
