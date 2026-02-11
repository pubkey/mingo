import { evalExpr } from "../../core/_internal";
import { Iterator } from "../../lazy";
import { AnyObject, Options } from "../../types";
import { assert, isObject } from "../../util";

/**
 * Replaces the input document with the specified document. The operation replaces all existing fields in the input document, including the _id field.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/replaceWith/ usage}.
 */
export function $replaceWith(
  collection: Iterator,
  expr: AnyObject,
  options: Options
): Iterator {
  return collection.map(obj => {
    obj = evalExpr(obj, expr, options);
    assert(isObject(obj), "$replaceWith expression must return an object");
    return obj;
  });
}
