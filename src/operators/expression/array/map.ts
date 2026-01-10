import { ComputeOptions, computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil } from "../../../util";
import { errExpectArray } from "../_internal";

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
  if (!isArray(input))
    return errExpectArray(options.failOnError, "$map 'input'");

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
