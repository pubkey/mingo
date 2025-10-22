import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, isNil, isString } from "../../../util";

/**
 * Replaces all instances of a matched string in a given input.
 *
 * @param  {AnyObject} obj
 * @param  {Array} expr
 */
export const $replaceAll: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as {
    input: string;
    find: string;
    replacement: string;
  };
  const arr = [args.input, args.find, args.replacement];
  if (arr.some(isNil)) return null;
  assert(
    arr.every(isString),
    "$replaceAll expression fields must evaluate to string"
  );
  return args.input.replace(new RegExp(args.find, "g"), args.replacement);
};
