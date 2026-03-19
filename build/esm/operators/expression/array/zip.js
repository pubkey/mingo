import { evalExpr } from "../../../core/_internal";
import {
  assert,
  has,
  isArray,
  isBoolean,
  isNil,
  isObject
} from "../../../util";
import { errExpectArray, errInvalidArgs } from "../_internal";
const $zip = (obj, expr, options) => {
  assert(
    isObject(expr) && has(expr, "inputs"),
    "$zip received invalid arguments"
  );
  const inputs = evalExpr(obj, expr.inputs, options);
  const defaults = evalExpr(obj, expr.defaults, options) ?? [];
  const useLongestLength = expr.useLongestLength ?? false;
  const foe = options.failOnError;
  if (isNil(inputs)) return null;
  if (!isArray(inputs)) return errExpectArray(foe, "$zip 'inputs'");
  let invalid = 0;
  for (const elem of inputs) {
    if (isNil(elem)) return null;
    if (!isArray(elem)) invalid++;
  }
  if (invalid) return errExpectArray(foe, "$zip elements of 'inputs'");
  if (!isBoolean(useLongestLength))
    errInvalidArgs(foe, "$zip 'useLongestLength' must be boolean");
  if (isArray(defaults) && defaults.length > 0) {
    assert(
      useLongestLength && defaults.length === inputs.length,
      "$zip 'useLongestLength' must be set to true to use 'defaults'"
    );
  }
  let zipCount = 0;
  for (const arr of inputs) {
    zipCount = useLongestLength ? Math.max(zipCount, arr.length) : Math.min(zipCount || arr.length, arr.length);
  }
  const result = [];
  for (let i = 0; i < zipCount; i++) {
    const temp = inputs.map((val, index) => {
      return isNil(val[i]) ? defaults[index] ?? null : val[i];
    });
    result.push(temp);
  }
  return result;
};
export {
  $zip
};
