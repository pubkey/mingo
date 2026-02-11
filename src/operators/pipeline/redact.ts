import { ComputeOptions, evalExpr } from "../../core/_internal";
import { Iterator } from "../../lazy";
import { Any, AnyObject, ArrayOrObject, Options } from "../../types";
import { has, isArray, isNil, isObject } from "../../util";

/**
 * Restricts the contents of the documents based on information stored in the documents themselves.
 *
 * See {@link https://docs.mongodb.com/manual/reference/operator/aggregation/redact/ usage}
 */
export function $redact(
  collection: Iterator,
  expr: AnyObject,
  options: Options
): Iterator {
  const copts = ComputeOptions.init(options);
  return collection.map((root: AnyObject) =>
    redact(root, expr, copts.update({ root }))
  );
}

function redact(obj: AnyObject, expr: Any, options: ComputeOptions): Any {
  const action = evalExpr(obj, expr, options);
  switch (action) {
    case "$$KEEP":
      return obj;
    case "$$PRUNE":
      return undefined;
    case "$$DESCEND": {
      // traverse nested documents iff there is a $cond
      if (!has(expr as AnyObject, "$cond")) return obj;

      const output: AnyObject = {};

      for (const [key, value] of Object.entries(obj)) {
        if (isArray(value)) {
          const res = new Array<Any>();
          for (let elem of value) {
            if (isObject(elem)) {
              elem = redact(elem, expr, options.update({ root: elem }));
            }
            if (!isNil(elem)) res.push(elem);
          }
          output[key] = res;
        } else if (isObject(value)) {
          const res = redact(
            value,
            expr,
            options.update({ root: value })
          ) as ArrayOrObject;
          if (!isNil(res)) output[key] = res;
        } else {
          output[key] = value;
        }
      }
      return output;
    }
    default:
      return action;
  }
}
