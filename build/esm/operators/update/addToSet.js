import { has, isArray, isObject, unique } from "../../util";
import {
  applyUpdate,
  clone,
  DEFAULT_OPTIONS,
  walkExpression
} from "./_internal";
function $addToSet(expr, arrayFilters = [], options = DEFAULT_OPTIONS) {
  return (obj) => {
    return walkExpression(expr, arrayFilters, options, (val, node, queries) => {
      const args = { $each: [val] };
      if (isObject(val) && has(val, "$each")) {
        Object.assign(args, val);
      }
      return applyUpdate(
        obj,
        node,
        queries,
        (o, k) => {
          const prev = o[k];
          if (isArray(prev)) {
            const set = unique(prev.concat(args.$each));
            if (set.length === prev.length) return false;
            o[k] = clone(set, options);
          } else if (prev === void 0) {
            o[k] = clone(args.$each, options);
          } else {
            return false;
          }
          return true;
        },
        { buildGraph: true }
      );
    });
  };
}
export {
  $addToSet
};
