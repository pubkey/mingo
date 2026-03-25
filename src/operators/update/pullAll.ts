import { Any, AnyObject } from "../../types";
import { DEFAULT_OPTIONS } from "./_internal";
import { $pull } from "./pull";

/** Removes all instances of the specified values from an existing array. */
export function $pullAll(
  expr: Record<string, Any[]>,
  arrayFilters: AnyObject[] = [],
  options = DEFAULT_OPTIONS
) {
  const pullExpr: Record<string, AnyObject> = {};
  for (const [k, v] of Object.entries(expr)) {
    pullExpr[k] = { $in: v };
  }
  return $pull(pullExpr, arrayFilters, options);
}
