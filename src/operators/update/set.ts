import { AnyObject } from "../../types";
import { isEqual } from "../../util";
import {
  applyUpdate,
  clone,
  DEFAULT_OPTIONS,
  walkExpression
} from "./_internal";

/** Replaces the value of a field with the specified value. */
export function $set(
  expr: AnyObject,
  arrayFilters: AnyObject[] = [],
  options = DEFAULT_OPTIONS
) {
  return (obj: AnyObject) => {
    return walkExpression(expr, arrayFilters, options, (val, node, queries) => {
      return applyUpdate(
        obj,
        node,
        queries,
        (o: AnyObject, k: string) => {
          if (isEqual(o[k], val)) return false;
          o[k] = clone(val, options);
          return true;
        },
        { buildGraph: true }
      );
    });
  };
}
