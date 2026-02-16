import { evalExpr } from "../../core/_internal";
import { Iterator } from "../../lazy";
import { AnyObject, Options } from "../../types";
import { removeValue, setValue } from "../../util";

/**
 * Adds new fields to documents. $addFields outputs documents that contain
 * all existing fields from the input documents and newly added fields.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields/ usage}.
 */
export function $addFields(
  coll: Iterator,
  expr: AnyObject,
  options: Options
): Iterator {
  const newFields = Object.keys(expr);

  if (newFields.length === 0) return coll;

  return coll.map((obj: AnyObject) => {
    const newObj = { ...obj };
    for (const field of newFields) {
      const newValue = evalExpr(obj, expr[field], options);
      if (newValue !== undefined) {
        setValue(newObj, field, newValue);
      } else {
        removeValue(newObj, field);
      }
    }
    return newObj;
  });
}
