import { isEqual } from "../../util";
import {
  applyUpdate,
  clone,
  DEFAULT_OPTIONS,
  walkExpression
} from "./_internal";
function $set(expr, arrayFilters = [], options = DEFAULT_OPTIONS) {
  return (obj) => {
    return walkExpression(expr, arrayFilters, options, (val, node, queries) => {
      return applyUpdate(
        obj,
        node,
        queries,
        (o, k) => {
          if (isEqual(o[k], val)) return false;
          o[k] = clone(val, options);
          return true;
        },
        { buildGraph: true }
      );
    });
  };
}
export {
  $set
};
