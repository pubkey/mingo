import { ComputeOptions, computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil, truthy } from "../../../util/_internal";
import { errExpectArray } from "../_internal";

/**
 * Selects a subset of the array to return an array with only the elements that match the filter condition.
 *
 * @param  {AnyObject} obj The current document
 * @param  {*} expr The filter spec
 * @return {*}
 */
export const $filter: ExpressionOperator = (
  obj: AnyObject,
  expr: {
    input: Any;
    as?: string;
    cond: Any;
    limit?: Any /*TODO: implement*/;
  },
  options: Options
): Any[] => {
  const input = computeValue(obj, expr.input, null, options) as Any[];
  if (isNil(input)) return null;

  if (!isArray(input)) {
    return errExpectArray(options.failOnError, "$filter 'input'");
  }

  const copts = ComputeOptions.init(options);
  const k = expr?.as || "this";
  const locals = {
    variables: { [k]: null }
  };
  return input.filter((o: Any) => {
    locals.variables[k] = o;
    const cond = computeValue(obj, expr.cond, null, copts.update(locals));
    // allow empty strings only in strict MongoDB mode (default).
    return truthy(cond, options.useStrictMode);
  });
};
