import { ComputeOptions } from "../../../core/_internal";
import { Any, AnyObject, Options } from "../../../types";
import {
  ensureArray,
  intersection,
  isNil,
  isPrimitive,
  resolve
} from "../../../util/_internal";

/**
 * Matches any of the values that exist in an array specified in the query.
 */
export const $in = (
  selector: string,
  value: Any,
  options: Options
): ((_: AnyObject) => boolean) => {
  const opts = { unwrapArray: true };
  const b = value as Any[];
  // precompute Set for primitive values at query compilation time
  const allPrimitive = b.every(isPrimitive);
  const lookupSet = allPrimitive ? new Set(b) : null;
  const hasNull = b.some(v => v === null);
  // pre-split the path once
  const pathArray = selector.split(".");
  const depth = Math.max(1, pathArray.length - 1);
  const copts = ComputeOptions.init(options).update({ depth });

  return (o: AnyObject): boolean => {
    const a = resolve(o, selector, opts, pathArray) as Any[];
    // queries for null should be able to find undefined fields
    if (isNil(a)) return hasNull;

    const lhs = ensureArray(a);

    if (lookupSet) {
      return lhs.some(v => lookupSet.has(v));
    }

    return intersection([lhs, b]).length > 0;
  };
};
