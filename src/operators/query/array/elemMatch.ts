import { ComputeOptions } from "../../../core/_internal";
import { Query } from "../../../query";
import { Any, AnyObject, Options } from "../../../types";
import { isArray, isEmpty, isOperator, resolve } from "../../../util/_internal";

function isNonBooleanOperator(name: string): boolean {
  return (
    isOperator(name) && name !== "$and" && name !== "$or" && name !== "$nor"
  );
}

/**
 * Selects documents if element in the array field matches all the specified $elemMatch conditions.
 */
export const $elemMatch = (
  selector: string,
  value: Any,
  options: Options
): ((_: AnyObject) => boolean) => {
  const opts = { unwrapArray: true };
  const b = value as AnyObject;

  // precompute criteria and format function at query compilation time
  let format = (x: Any) => x;
  let criteria = b;
  if (Object.keys(b).every(isNonBooleanOperator)) {
    criteria = { temp: b };
    format = x => ({ temp: x });
  }

  // pre-split the path once
  const pathArray = selector.split(".");
  const depth = Math.max(1, pathArray.length - 1);
  const copts = ComputeOptions.init(options).update({ depth });

  // create query once, reuse for all documents
  const query = new Query(criteria, copts);

  return (o: AnyObject): boolean => {
    const a = resolve(o, selector, opts, pathArray) as Any[];
    if (isArray(a) && !isEmpty(a)) {
      for (let i = 0, len = a.length; i < len; i++) {
        if (query.test(format(a[i]) as AnyObject)) {
          return true;
        }
      }
    }
    return false;
  };
};
