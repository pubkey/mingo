import { UpdateOptions } from "../../core";
import { Any, AnyObject, ArrayOrObject } from "../../types";
import { assert, isArray } from "../../util";
import {
  Action,
  applyUpdate,
  DEFAULT_OPTIONS,
  walkExpression
} from "./_internal";

/** Removes the first or last element of an array. */
export const $pop = (
  obj: AnyObject,
  expr: Record<string, 1 | -1>,
  arrayFilters: AnyObject[] = [],
  options: UpdateOptions = DEFAULT_OPTIONS
) => {
  return walkExpression(expr, arrayFilters, options, ((val, node, queries) => {
    return applyUpdate(obj, node, queries, (o: ArrayOrObject, k: string) => {
      const arr = o[k] as Any[];
      assert(
        isArray(arr),
        `path '${node.selector}' contains an element of non-array type.`
      );
      if (!arr.length) return false;
      if (val === -1) {
        arr.splice(0, 1);
      } else {
        arr.pop();
      }
      return true;
    });
  }) as Action<number>);
};
