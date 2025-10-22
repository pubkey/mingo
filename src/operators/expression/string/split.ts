import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, isNil, isString } from "../../../util";

/**
 * Splits a string into substrings based on a delimiter.
 * If the delimiter is not found within the string, returns an array containing the original string.
 *
 * @param  {AnyObject} obj
 * @param  {Array} expr
 * @return {Array} Returns an array of substrings.
 */
export const $split: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as string[];
  if (isNil(args[0])) return null;
  assert(
    args.every(isString),
    "$split expression must result to array(2) of strings"
  );
  return args[0].split(args[1]);
};
