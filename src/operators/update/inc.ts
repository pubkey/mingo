import { AnyObject, ArrayOrObject, Options } from "../../types";
import { isNumber } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";

/** Increments a field by a specified value. */
export const $inc = (
  expr: Record<string, number>,
  arrayFilters: AnyObject[] = [],
  options: Options = DEFAULT_OPTIONS
) => {
  return (obj: AnyObject) => {
    return walkExpression<number>(
      expr,
      arrayFilters,
      options,
      (val, node, queries) => {
        return applyUpdate(
          obj,
          node,
          queries,
          (o: ArrayOrObject, k: number) => {
            if (isNumber(o[k]) || o[k] === undefined) {
              o[k] ||= 0;
              o[k] += val;
              return true;
            }
            return false;
          },
          { buildGraph: true }
        );
      }
    );
  };
};
