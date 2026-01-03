import { ComputeOptions } from "../../core/_internal";
import { AnyObject, ArrayOrObject, Options } from "../../types";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";

type CurrentDateType = true | { $type: "date" | "timestamp" };

/** Sets the value of a field to the current date. */
export const $currentDate = (
  expr: Record<string, CurrentDateType>,
  arrayFilters: AnyObject[] = [],
  options: Options = DEFAULT_OPTIONS
) => {
  const copts = options as ComputeOptions;
  return (obj: AnyObject) => {
    return walkExpression<CurrentDateType>(
      expr,
      arrayFilters,
      options,
      (val, node, queries) => {
        return applyUpdate(
          obj,
          node,
          queries,
          (o: ArrayOrObject, k: string | number) => {
            o[k] =
              val === true || val.$type === "date"
                ? copts.now
                : copts.now.getTime();
            return true;
          },
          { buildGraph: true }
        );
      }
    );
  };
};
