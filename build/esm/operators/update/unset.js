import { has, isArray, isEqual } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";
function $unset(expr, arrayFilters = [], options = DEFAULT_OPTIONS) {
  return (obj) => {
    return walkExpression(expr, arrayFilters, options, (_, node, queries) => {
      return applyUpdate(obj, node, queries, (o, k) => {
        if (!has(o, k)) return false;
        const prev = o[k];
        if (isArray(o)) o[k] = null;
        else delete o[k];
        return !isEqual(prev, o[k]);
      });
    });
  };
}
export {
  $unset
};
