import { ComputeOptions, evalExpr } from "../../../core/_internal";
import {
  assert,
  has,
  isArray,
  isInteger,
  isNil,
  isObject,
  truthy
} from "../../../util/_internal";
import { errExpectArray, errExpectNumber } from "../_internal";
const $filter = (obj, expr, options) => {
  assert(
    isObject(expr) && has(expr, "input", "cond"),
    "$filter expects object { input, as, cond, limit }"
  );
  const input = evalExpr(obj, expr.input, options);
  const foe = options.failOnError;
  if (isNil(input)) return null;
  if (!isArray(input)) return errExpectArray(foe, "$filter 'input'");
  const limit = expr.limit ?? Math.max(input.length, 1);
  if (!isInteger(limit) || limit < 1)
    return errExpectNumber(foe, "$filter 'limit'", { min: 1, int: true });
  if (input.length === 0) return [];
  const copts = ComputeOptions.init(options);
  const k = expr?.as || "this";
  const locals = { variables: {} };
  const res = [];
  for (let i = 0, j = 0; i < input.length && j < limit; i++) {
    locals.variables[k] = input[i];
    const cond = evalExpr(obj, expr.cond, copts.update(locals));
    if (truthy(cond, options.useStrictMode)) {
      res.push(input[i]);
      j++;
    }
  }
  return res;
};
export {
  $filter
};
