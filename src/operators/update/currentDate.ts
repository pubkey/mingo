import { ComputeOptions } from "../../core/_internal";
import { AnyObject, ArrayOrObject, Options } from "../../types";
import { isObject } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";

type CurrentDateType = true | { $type: "date" | "timestamp" };

/** Sets the value of a field to the current date. */
export const $currentDate = (
  obj: AnyObject,
  expr: Record<string, CurrentDateType>,
  arrayFilters: AnyObject[] = [],
  options: Options = DEFAULT_OPTIONS
) => {
  const copts = options as ComputeOptions;

  assert(
    Object.values(expr).every(
      v =>
        v === true ||
        (isObject(v) && (v.$type === "date" || v.$type === "timestamp"))
    ),
    `$currentDate: $type must be either 'date' or 'timestamp' if specified.`
  );

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
