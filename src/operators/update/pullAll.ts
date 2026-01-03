import { Any, AnyObject, Options } from "../../types";
import { DEFAULT_OPTIONS } from "./_internal";
import { $pull } from "./pull";

/** Removes all instances of the specified values from an existing array. */
export const $pullAll = (
  expr: Record<string, Any[]>,
  arrayFilters: AnyObject[] = [],
  options: Options = DEFAULT_OPTIONS
) => {
  const pullExpr: Record<string, AnyObject> = {};
  Object.entries(expr).forEach(([k, v]) => {
    pullExpr[k] = { $in: v };
  });
  return $pull(pullExpr, arrayFilters, options);
};
