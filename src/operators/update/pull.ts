import { Query } from "../../query";
import { Any, AnyObject } from "../../types";
import { isArray, isObject, isOperator } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";

/** Removes from an existing array all instances of a value or values that match a specified condition. */
export function $pull(
  expr: AnyObject,
  arrayFilters: AnyObject[] = [],
  options = DEFAULT_OPTIONS
) {
  return (obj: AnyObject) => {
    return walkExpression(expr, arrayFilters, options, (val, node, queries) => {
      // wrap simple values or condition objects
      const wrap = !isObject(val) || Object.keys(val).some(isOperator);
      const query = new Query(wrap ? { k: val } : val, options);
      const pred = wrap
        ? (v: Any) => query.test({ k: v })
        : (v: Any) => query.test(v as AnyObject);
      return applyUpdate(obj, node, queries, (o: AnyObject, k: string) => {
        const prev = o[k] as Any[];
        if (!isArray(prev) || !prev.length) return false;

        const curr = new Array<Any>();
        let ok = false;
        prev.forEach(v => {
          const b = pred(v);
          if (!b) curr.push(v);
          ok ||= b;
        });
        if (!ok) return false;
        o[k] = curr;
        return true;
      });
    });
  };
}
