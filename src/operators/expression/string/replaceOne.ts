import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, isNil, isString } from "../../../util";

/**
 * Replaces the first instance of a matched string in a given input.
 *
 * @param  {AnyObject} obj
 * @param  {Array} expr
 */
export const $replaceOne: ExpressionOperator = (
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
    "$replaceOne expression fields must evaluate to string"
  );
  return args.input.replace(args.find, args.replacement);
};
