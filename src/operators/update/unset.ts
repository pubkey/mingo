import { AnyObject, ArrayOrObject, Options } from "../../types";
import { has, isArray } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";

/** Deletes a particular field */
export const $unset = (
  obj: AnyObject,
  expr: Record<string, "">,
  arrayFilters: AnyObject[] = [],
  options: Options = DEFAULT_OPTIONS
): string[] => {
  return walkExpression(expr, arrayFilters, options, (_, node, queries) => {
    return applyUpdate(obj, node, queries, (o: ArrayOrObject, k: string) => {
      if (!has(o as AnyObject, k)) return false;
      if (isArray(o)) {
        o[k] = null;
      } else {
        delete o[k];
      }
      return true;
    });
  });
};
