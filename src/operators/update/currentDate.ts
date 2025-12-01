import { AnyObject, ArrayOrObject, Options } from "../../types";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";

type CurrentDateType = true | { $type: "date" | "timestamp" };

/** Sets the value of a field to the current date. */
export const $currentDate = (
  obj: AnyObject,
  expr: Record<string, CurrentDateType>,
  arrayFilters: AnyObject[] = [],
  options: Options = DEFAULT_OPTIONS
) => {
  const now = Date.now();
  return walkExpression<CurrentDateType>(
    expr,
    arrayFilters,
    options,
    (_, node, queries) => {
      return applyUpdate(
        obj,
        node,
        queries,
        (o: ArrayOrObject, k: string | number) => {
          o[k] = now;
          return true;
        },
        { buildGraph: true }
      );
    }
  );
};
