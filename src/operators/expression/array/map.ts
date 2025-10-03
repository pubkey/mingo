import {
  ComputeOptions,
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core";
import { Any, AnyObject } from "../../../types";
import { assert, isArray, isNil } from "../../../util";

/**
 * Applies a sub-expression to each element of an array and returns the array of resulting values in order.
 *
 * @param obj
 * @param expr
 * @returns {Any[]|*}
 */
export const $map: ExpressionOperator = (
  obj: AnyObject,
  expr: { input: Any[]; as: string; in: Any },
  options: Options
): Any => {
  const input = computeValue(obj, expr.input, null, options) as Any[];
  if (isNil(input)) return null;
  assert(isArray(input), `$map 'input' expression must resolve to an array`);

  const copts = ComputeOptions.init(options);
  const k = expr.as || "this";
  const locals = {
    variables: { [k]: null }
  };
  return input.map((o: Any) => {
    locals.variables[k] = o;
    return computeValue(obj, expr.in, null, copts.update(locals));
  });
};
