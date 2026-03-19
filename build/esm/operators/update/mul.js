import { isNumber } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";
function $mul(expr, arrayFilters = [], options = DEFAULT_OPTIONS) {
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
            const prev = o[k];
            if (isNumber(o[k])) o[k] = o[k] * val;
            else if (o[k] === void 0) o[k] = 0;
            return o[k] !== prev;
          },
          { buildGraph: true }
        );
      }
    );
  };
}
export {
  $mul
};
