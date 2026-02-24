import { AnyObject } from "../../types";
import { compare } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";

/** Updates the value of the field to a specified value if the specified value is greater than the current value of the field. */
export function $max(
  expr: AnyObject,
  arrayFilters: AnyObject[] = [],
  options = DEFAULT_OPTIONS
) {
  return (obj: AnyObject) => {
    return walkExpression(expr, arrayFilters, options, (val, node, queries) => {
      // If the field does not exist, the $max operator sets the field to the specified value.
      return applyUpdate(
        obj,
        node,
        queries,
        (o: AnyObject, k: string | number) => {
          if (compare(o[k], val) > -1) return false;
          o[k] = val;
          return true;
        },
        { buildGraph: true }
      );
    });
  };
}
