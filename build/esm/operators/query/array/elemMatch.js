import { ComputeOptions } from "../../../core/_internal";
import { Query } from "../../../query";
import { isArray, isEmpty, isOperator, resolve } from "../../../util/_internal";
function isNonBooleanOperator(name) {
  return isOperator(name) && name !== "$and" && name !== "$or" && name !== "$nor";
}
const $elemMatch = (selector, value, options) => {
  const opts = { unwrapArray: true };
  const b = value;
  let format = (x) => x;
  let criteria = b;
  if (Object.keys(b).every(isNonBooleanOperator)) {
    criteria = { temp: b };
    format = (x) => ({ temp: x });
  }
  const pathArray = selector.split(".");
  const depth = Math.max(1, pathArray.length - 1);
  const copts = ComputeOptions.init(options).update({ depth });
  const query = new Query(criteria, copts);
  return (o) => {
    const a = resolve(o, selector, opts, pathArray);
    if (isArray(a) && !isEmpty(a)) {
      for (let i = 0, len = a.length; i < len; i++) {
        if (query.test(format(a[i]))) {
          return true;
        }
      }
    }
    return false;
  };
};
export {
  $elemMatch
};
