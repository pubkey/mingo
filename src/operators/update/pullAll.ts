import { UpdateOptions } from "../../core";
import { Any, AnyObject } from "../../types";
import { DEFAULT_OPTIONS } from "./_internal";
import { $pull } from "./pull";

/** Removes all instances of the specified values from an existing array. */
export const $pullAll = (
  obj: AnyObject,
  expr: Record<string, Any[]>,
  arrayFilters: AnyObject[] = [],
  options: UpdateOptions = DEFAULT_OPTIONS
) => {
  const pullExpr: Record<string, AnyObject> = {};
  Object.entries(expr).forEach(([k, v]) => {
    pullExpr[k] = { $in: v };
  });
  return $pull(obj, pullExpr, arrayFilters, options);
};
