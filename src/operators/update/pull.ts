import { Options } from "../../core";
import { Query } from "../../query";
import { Any, AnyObject, ArrayOrObject } from "../../types";
import { isObject, isOperator } from "../../util";
import {
  Action,
  applyUpdate,
  DEFAULT_OPTIONS,
  walkExpression
} from "./_internal";

/** Removes from an existing array all instances of a value or values that match a specified condition. */
export const $pull = (
  obj: AnyObject,
  expr: AnyObject,
  arrayFilters: AnyObject[] = [],
  options: Options = DEFAULT_OPTIONS
) => {
  return walkExpression(expr, arrayFilters, options, ((val, node, queries) => {
    // wrap simple values or condition objects
    const wrap = !isObject(val) || Object.keys(val).some(isOperator);
    const query = new Query(wrap ? { k: val } : (val as AnyObject), options);
    const pred = wrap
      ? (v: Any) => query.test({ k: v })
      : (v: Any) => query.test(v);
    return applyUpdate(obj, node, queries, (o: ArrayOrObject, k: string) => {
      const prev = o[k] as Any[];
      const curr = new Array<Any>();
      const found = prev
        .map(v => {
          const b = pred(v);
          if (!b) curr.push(v);
          return b;
        })
        .some(Boolean);
      if (!found) return false;
      o[k] = curr;
      return true;
    });
  }) as Action);
};
