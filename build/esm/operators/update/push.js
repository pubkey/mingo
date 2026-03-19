import {
  compare,
  has,
  isArray,
  isEqual,
  isNumber,
  isObject,
  resolve
} from "../../util";
import {
  applyUpdate,
  clone,
  DEFAULT_OPTIONS,
  walkExpression
} from "./_internal";
const MODIFIERS = ["$each", "$slice", "$sort", "$position"];
function $push(expr, arrayFilters = [], options = DEFAULT_OPTIONS) {
  return (obj) => {
    return walkExpression(expr, arrayFilters, options, (val, node, queries) => {
      const args = {
        $each: [val]
      };
      if (isObject(val) && MODIFIERS.some((m) => has(val, m))) {
        Object.assign(args, val);
      }
      return applyUpdate(
        obj,
        node,
        queries,
        (o, k) => {
          const arr = o[k];
          if (!isArray(arr)) {
            if (arr === void 0) {
              o[k] = clone(args.$each, options);
              return true;
            }
            return false;
          }
          const prev = arr.slice(0, args.$slice || arr.length);
          const oldsize = arr.length;
          const pos = isNumber(args.$position) ? args.$position : arr.length;
          arr.splice(pos, 0, ...clone(args.$each, options));
          if (args.$sort) {
            const sortKey = isObject(args.$sort) ? Object.keys(args.$sort)[0] : "";
            const order = !sortKey ? args.$sort : args.$sort[sortKey];
            const f = !sortKey ? (a) => a : (a) => resolve(a, sortKey);
            arr.sort((a, b) => order * compare(f(a), f(b)));
          }
          if (isNumber(args.$slice)) {
            if (args.$slice < 0) arr.splice(0, arr.length + args.$slice);
            else arr.splice(args.$slice);
          }
          return oldsize != arr.length || !isEqual(prev, arr);
        },
        { descendArray: true, buildGraph: true }
      );
    });
  };
}
export {
  $push
};
