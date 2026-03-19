import { evalExpr } from "../../../core/_internal";
import { flatten, has, isArray, isNil, isObject } from "../../../util";
import { errExpectArray } from "../_internal";
const ERR_OPTS = {
  generic: { type: "key-value pairs" },
  array: { type: "[k,v]" },
  object: { type: "{k,v}" }
};
const $arrayToObject = (obj, expr, options) => {
  const foe = options.failOnError;
  const arr = evalExpr(obj, expr, options);
  if (isNil(arr)) return null;
  if (!isArray(arr))
    return errExpectArray(foe, "$arrayToObject", ERR_OPTS.generic);
  let tag = 0;
  const newObj = {};
  for (const item of arr) {
    if (isArray(item)) {
      const val = flatten(item);
      if (!tag) tag = 1;
      if (tag !== 1) {
        return errExpectArray(foe, "$arrayToObject", ERR_OPTS.object);
      }
      const [k, v] = val;
      newObj[k] = v;
    } else if (isObject(item) && has(item, "k", "v")) {
      if (!tag) tag = 2;
      if (tag !== 2) {
        return errExpectArray(foe, "$arrayToObject", ERR_OPTS.array);
      }
      const { k, v } = item;
      newObj[k] = v;
    } else {
      return errExpectArray(foe, "$arrayToObject", ERR_OPTS.generic);
    }
  }
  return newObj;
};
export {
  $arrayToObject
};
