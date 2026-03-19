import { DEFAULT_OPTIONS } from "./_internal";
import { $pull } from "./pull";
function $pullAll(expr, arrayFilters = [], options = DEFAULT_OPTIONS) {
  const pullExpr = {};
  Object.entries(expr).forEach(([k, v]) => {
    pullExpr[k] = { $in: v };
  });
  return $pull(pullExpr, arrayFilters, options);
}
export {
  $pullAll
};
