import { AnyObject, ArrayOrObject, Options } from "../../types";
import { assert, isNumber, resolve } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";

/** Increments a field by a specified value. */
export const $inc = (
  obj: AnyObject,
  expr: Record<string, number>,
  arrayFilters: AnyObject[] = [],
  options: Options = DEFAULT_OPTIONS
) => {
  return walkExpression<number>(
    expr,
    arrayFilters,
    options,
    (val, node, queries) => {
      if (!node.position) {
        const n = resolve(obj, node.selector);
        assert(
          n === undefined || isNumber(n),
          `cannot apply $inc to a value of non-numeric type`
        );
      }
      return applyUpdate(
        obj,
        node,
        queries,
        (o: ArrayOrObject, k: number) => {
          o[k] = ((o[k] ||= 0) as number) + val;
          return true;
        },
        { buildGraph: true }
      );
    }
  );
};
