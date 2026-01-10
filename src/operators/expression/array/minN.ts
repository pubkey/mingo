import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil } from "../../../util";
import { $minN as __minN } from "../../accumulator/minN";
import { errExpectArray } from "../_internal";

interface InputExpr {
  n: Any;
  input: Any;
}

/**
 * Returns the n smallest values in an array.
 *
 * @param  {AnyObject} obj
 * @param  {*} expr
 * @return {*}
 */
export const $minN: ExpressionOperator = (
  obj: AnyObject,
  expr: InputExpr,
  options: Options
): Any => {
  // first try the accumulator if input is an array.
  if (isArray(obj)) return __minN(obj, expr, options);
  const { input, n } = computeValue(obj, expr, null, options) as InputExpr;
  if (isNil(input)) return null;
  if (!isArray(input))
    return errExpectArray(options.failOnError, "$minN 'input'");
  return __minN(input as AnyObject[], { n, input: "$$this" }, options);
};
