import { ComputeOptions, evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, has, isArray, isNil, isObject, isString } from "../../../util";
import { errExpectArray, errExpectString } from "../_internal";

/**
 * Applies a sub-expression to each element of an array and returns the array of resulting values in order.
 */
export const $map: ExpressionOperator = (
  obj: AnyObject,
  expr: { input: Any[]; as: string; in: Any },
  options: Options
): Any => {
  assert(
    isObject(expr) && has(expr, "input", "in"),
    "$map expects object { input, as, in }"
  );
  const input = evalExpr(obj, expr.input, options) as Any[];
  const foe = options.failOnError;
  if (isNil(input)) return null;
  if (!isArray(input)) return errExpectArray(foe, "$map 'input'");
  if (!isNil(expr.as) && !isString(expr.as))
    return errExpectString(foe, "$map 'as'");

  const copts = ComputeOptions.init(options);
  const k = expr.as || "this";
  const locals = { variables: { [k]: null } };
  return input.map((o: Any) => {
    locals.variables[k] = o;
    return evalExpr(obj, expr.in, copts.update(locals));
  });
};
