import { evalExpr } from "../../core/_internal";
import { Iterator } from "../../lazy";
import { AnyObject, Options } from "../../types";
import { assert, isObject } from "../../util";

/**
 * Replaces a document with the specified embedded document or new one.
 * The replacement document can be any valid expression that resolves to a document.
 *
 * See {@link https://docs.mongodb.com/manual/reference/operator/aggregation/replaceRoot/ usage}.
 */
export function $replaceRoot(
  collection: Iterator,
  expr: { newRoot: AnyObject },
  options: Options
): Iterator {
  return collection.map(obj => {
    obj = evalExpr(obj, expr.newRoot, options);
    assert(isObject(obj), "$replaceRoot expression must return an object");
    return obj;
  });
}
