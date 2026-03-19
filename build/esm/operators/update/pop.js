import { isArray } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";
function $pop(expr, arrayFilters = [], options = DEFAULT_OPTIONS) {
  return (obj) => {
    return walkExpression(
      expr,
      arrayFilters,
      options,
      (val, node, queries) => {
        return applyUpdate(obj, node, queries, (o, k) => {
          const arr = o[k];
          if (!isArray(arr) || !arr.length) return false;
          if (val === -1) arr.splice(0, 1);
          else arr.pop();
          return true;
        });
      }
    );
  };
}
export {
  $pop
};
