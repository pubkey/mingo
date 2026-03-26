import { ComputeOptions } from "../../../core/_internal";
import { Query } from "../../../query";
import { Any, AnyObject, Options } from "../../../types";
import { isArray, isOperator, resolve } from "../../../util";

/**
 * Selects documents if element in the array field matches all the specified $elemMatch conditions.
 */
export const $elemMatch = (
  selector: string,
  value: AnyObject,
  options: Options
) => {
  // precompute criteria and format function at query compilation time
  let format = (x: Any) => x;
  let criteria = value;
  // determine if we need to wrap the criteria in a temporary key to avoid confusion with top-level operators.
  let wrap = true;
  for (const k of Object.keys(value)) {
    wrap &&= isOperator(k) && "$and" !== k && "$or" !== k && "$nor" !== k;
    if (!wrap) break;
  }
  if (wrap) {
    criteria = { field: value };
    format = x => ({ field: x });
  }

  // pre-split the path once
  const pathArray = selector.split(".");
  const depth = Math.max(1, pathArray.length - 1);
  const copts = ComputeOptions.init(options).update({ depth });
  const opts = { unwrapArray: true, pathArray };

  // create query once, reuse for all documents
  const query = new Query(criteria, copts);

  return (o: AnyObject): boolean => {
    const a = resolve(o, selector, opts) as Any[];
    if (isArray(a)) {
      for (let i = 0; i < a.length; i++) {
        if (query.test(format(a[i]) as AnyObject)) return true;
      }
    }
    return false;
  };
};
