import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isNil, isObject } from "../../../util";
import { errExpectObject } from "../_internal";

/**
 * Converts a document to an array of documents representing key-value pairs.
 */
export const $objectToArray: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const val = evalExpr(obj, expr, options) as AnyObject;
  if (isNil(val)) return null;
  if (!isObject(val))
    return errExpectObject(options.failOnError, "$objectToArray");

  const entries = Object.entries(val);
  const result = new Array<Any>(entries.length);
  let i = 0;
  for (const [k, v] of entries) {
    result[i++] = { k, v };
  }
  return result;
};
