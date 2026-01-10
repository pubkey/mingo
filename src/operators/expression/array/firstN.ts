import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil } from "../../../util";
import { $firstN as __firstN } from "../../accumulator/firstN";
import { errExpectArray } from "../_internal";

interface InputExpr {
  n: Any;
  input: Any;
}

/**
 * Returns a specified number of elements from the beginning of an array.
 *
 * @param  {AnyObject} obj
 * @param  {*} expr
 * @return {*}
 */
export const $firstN: ExpressionOperator = (
  obj: AnyObject,
  expr: InputExpr,
  options: Options
): Any => {
  // first try the accumulator if input is an array.
  if (isArray(obj)) return __firstN(obj, expr, options);
  const { input, n } = computeValue(obj, expr, null, options) as InputExpr;
  if (isNil(input)) return null;
  if (!isArray(input))
    return errExpectArray(options.failOnError, "$firstN 'input'");
  return __firstN(input as AnyObject[], { n, input: "$$this" }, options);
};
