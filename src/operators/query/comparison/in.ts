import { Any, AnyObject, Options } from "../../../types";
import {
  ensureArray,
  isNil,
  isPrimitive,
  resolve
} from "../../../util/_internal";
import { $in as __in, processQuery } from "../../_predicates";

/**
 * Matches any of the values that exist in an array specified in the query.
 */
export const $in = (selector: string, value: Any, options: Options) => {
  const b = value as Any[];

  // fast path: pre-build a Set for O(1) lookups when all values are primitives
  if (b.every(isPrimitive)) {
    const set = new Set(b);
    const pathArray = selector.split(".");
    return (o: AnyObject): boolean => {
      const a = resolve(o, selector, { unwrapArray: true }, pathArray);
      if (isNil(a)) return set.has(null);
      return ensureArray(a).some(v => set.has(v));
    };
  }

  // non-primitive values (regex, objects): use standard deep-equality intersection
  return processQuery(selector, value, options, __in);
};
