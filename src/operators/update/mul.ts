import { AnyObject, ArrayOrObject, Options } from "../../types";
import { isNumber } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";

/** Multiply the value of a field by a number. */
export const $mul = (
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
          (o: ArrayOrObject, k: string | number) => {
            const prev = o[k] as number;
            if (isNumber(o[k])) o[k] = o[k] * val;
            else if (o[k] === undefined) o[k] = 0;
            return o[k] !== prev;
          },
          { buildGraph: true }
        );
      }
    );
  };
};
