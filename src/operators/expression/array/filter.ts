import { ComputeOptions, computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
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

/**
 * Selects a subset of the array to return an array with only the elements that match the filter condition.
 */
export const $filter: ExpressionOperator = (
  obj: AnyObject,
  expr: {
    input: Any;
    as?: string;
    cond: Any;
    limit?: Any;
  },
  options: Options
): Any[] => {
  assert(
    isObject(expr) && has(expr, "input", "cond"),
    "$filter expects object { input, as, cond, limit }"
  );
  const input = computeValue(obj, expr.input, null, options) as Any[];
  const foe = options.failOnError;

  if (isNil(input)) return null;
  if (!isArray(input)) return errExpectArray(foe, "$filter 'input'");

  const limit = (expr.limit as number) ?? Math.max(input.length, 1);
  if (!isInteger(limit) || limit < 1)
    return errExpectNumber(foe, "$filter 'limit'", { min: 1, int: true });

  // exit early
  if (input.length === 0) return [];

  const copts = ComputeOptions.init(options);
  const k = expr?.as || "this";
  const locals = {
    variables: { [k]: null }
  };

  const res = [];

  for (let i = 0, j = 0; i < input.length && j < limit; i++) {
    locals.variables[k] = input[i];
    const cond = computeValue(obj, expr.cond, null, copts.update(locals));
    // allow empty strings only in strict MongoDB mode (default).
    if (truthy(cond, options.useStrictMode)) {
      res.push(input[i]);
      j++;
    }
  }

  return res;
};
