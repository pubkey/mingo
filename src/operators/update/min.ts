import { AnyObject, ArrayOrObject, Options } from "../../types";
import { compare } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";

/** Updates the value of the field to a specified value if the specified value is less than the current value of the field. */
export const $min = (
  expr: AnyObject,
  arrayFilters: AnyObject[] = [],
  options: Options = DEFAULT_OPTIONS
) => {
  return (obj: AnyObject) => {
    return walkExpression(expr, arrayFilters, options, (val, node, queries) => {
      // If the field does not exist, the $min operator sets the field to the specified value.
      return applyUpdate(
        obj,
        node,
        queries,
        (o: ArrayOrObject, k: string | number) => {
          if (compare(o[k], val) < 1) return false;
          o[k] = val;
          return true;
        },
        { buildGraph: true }
      );
    });
  };
};
