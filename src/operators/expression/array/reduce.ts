import {
  ComputeOptions,
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core";
import { Any, AnyObject } from "../../../types";
import { assert, isArray, isNil } from "../../../util";

/**
 * Applies an expression to each element in an array and combines them into a single value.
 *
 * @param obj
 * @param expr
 */
export const $reduce: ExpressionOperator = (
  obj: AnyObject,
  expr: AnyObject,
  options: Options
): Any => {
  const input = computeValue(obj, expr.input, null, options) as Any[];
  const initialValue = computeValue(obj, expr.initialValue, null, options);
  const inExpr = expr["in"];

  if (isNil(input)) return null;
  assert(isArray(input), "$reduce 'input' expression must resolve to an array");

  const copts = ComputeOptions.init(options);
  const locals = {
    variables: { value: null }
  };
  return input.reduce((acc, n) => {
    locals.variables.value = acc;
    return computeValue(n, inExpr, null, copts.update(locals));
  }, initialValue);
};
