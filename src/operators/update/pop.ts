import { Any, AnyObject, ArrayOrObject, Options } from "../../types";
import { isArray } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";

/** Removes the first or last element of an array. */
export const $pop = (
  expr: Record<string, 1 | -1>,
  arrayFilters: AnyObject[] = [],
  options: Options = DEFAULT_OPTIONS
) => {
  return (obj: AnyObject) => {
    return walkExpression<1 | -1>(
      expr,
      arrayFilters,
      options,
      (val, node, queries) => {
        return applyUpdate(
          obj,
          node,
          queries,
          (o: ArrayOrObject, k: string) => {
            const arr = o[k] as Any[];
            if (!isArray(arr) || !arr.length) return false;
            if (val === -1) arr.splice(0, 1);
            else arr.pop();
            return true;
          }
        );
      }
    );
  };
};
