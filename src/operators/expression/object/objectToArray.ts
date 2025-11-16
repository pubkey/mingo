import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, isNil, isObject, typeOf } from "../../../util";

/**
 * Converts a document to an array of documents representing key-value pairs.
 *
 * @param {*} obj The target object for this expression
 * @param {*} expr The right-hand side of the operator
 * @param {Options} options Options to use for operation
 */
export const $objectToArray: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const val = computeValue(obj, expr, null, options) as AnyObject;
  if (isNil(val)) return null;
  assert(
    isObject(val),
    `$objectToArray requires a document input, found: ${typeOf(val)}`
  );
  const entries = Object.entries(val);
  const result = new Array<Any>(entries.length);
  let i = 0;
  for (const [k, v] of entries) {
    result[i++] = { k, v };
  }
  return result;
};
