import { isNumber } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";
function $inc(expr, arrayFilters = [], options = DEFAULT_OPTIONS) {
  return (obj) => {
    return walkExpression(
      expr,
      arrayFilters,
      options,
      (val, node, queries) => {
        return applyUpdate(
          obj,
          node,
          queries,
          (o, k) => {
            if (isNumber(o[k]) || o[k] === void 0) {
              o[k] ||= 0;
              o[k] += val;
              return true;
            }
            return false;
          },
          { buildGraph: true }
        );
      }
    );
  };
}
export {
  $inc
};
