import { compare } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";
function $min(expr, arrayFilters = [], options = DEFAULT_OPTIONS) {
  return (obj) => {
    return walkExpression(expr, arrayFilters, options, (val, node, queries) => {
      return applyUpdate(
        obj,
        node,
        queries,
        (o, k) => {
          if (compare(o[k], val) < 1) return false;
          o[k] = val;
          return true;
        },
        { buildGraph: true }
      );
    });
  };
}
export {
  $min
};
