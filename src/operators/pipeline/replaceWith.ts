import { computeValue, Options, PipelineOperator } from "../../core/_internal";
import { Iterator } from "../../lazy";
import { AnyObject } from "../../types";
import { assert, isObject } from "../../util";

/**
 * Replaces the input document with the specified document. The operation replaces all existing fields in the input document, including the _id field.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/replaceWith/ usage}.
 *
 * @param collection
 * @param expr
 * @param options
 * @returns
 */
export const $replaceWith: PipelineOperator = (
  collection: Iterator,
  expr: AnyObject,
  options: Options
): Iterator => {
  return collection.map(obj => {
    obj = computeValue(obj, expr, null, options);
    assert(isObject(obj), "$replaceWith expression must return an object");
    return obj;
  });
};
