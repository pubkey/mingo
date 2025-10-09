import { UpdateOptions } from "../../core";
import { Any, AnyObject, ArrayOrObject } from "../../types";
import { isEqual } from "../../util";
import {
  applyUpdate,
  clone,
  DEFAULT_OPTIONS,
  walkExpression
} from "./_internal";

/** Replaces the value of a field with the specified value. */
export const $set = (
  obj: AnyObject,
  expr: Record<string, Any>,
  arrayFilters: AnyObject[] = [],
  options: UpdateOptions = DEFAULT_OPTIONS
) => {
  return walkExpression(expr, arrayFilters, options, (val, node, queries) => {
    return applyUpdate(
      obj,
      node,
      queries,
      (o: ArrayOrObject, k: string) => {
        if (isEqual(o[k], val)) return false;
        o[k] = clone(options.cloneMode, val);
        return true;
      },
      { buildGraph: true }
    );
  });
};
