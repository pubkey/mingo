import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, isArray, isNil } from "../../../util";
import { $firstN as __firstN } from "../../accumulator/firstN";

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
  assert(isArray(input), "$firstN: 'input' must resolve to an array.");
  return __firstN(input as AnyObject[], { n, input: "$$this" }, options);
};
