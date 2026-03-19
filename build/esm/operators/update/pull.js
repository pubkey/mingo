import { Query } from "../../query";
import { isArray, isObject, isOperator } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";
function $pull(expr, arrayFilters = [], options = DEFAULT_OPTIONS) {
  return (obj) => {
    return walkExpression(expr, arrayFilters, options, (val, node, queries) => {
      const wrap = !isObject(val) || Object.keys(val).some(isOperator);
      const query = new Query(wrap ? { k: val } : val, options);
      const pred = wrap ? (v) => query.test({ k: v }) : (v) => query.test(v);
      return applyUpdate(obj, node, queries, (o, k) => {
        const prev = o[k];
        if (!isArray(prev) || !prev.length) return false;
        const curr = new Array();
        let ok = false;
        prev.forEach((v) => {
          const b = pred(v);
          if (!b) curr.push(v);
          ok ||= b;
        });
        if (!ok) return false;
        o[k] = curr;
        return true;
      });
    });
  };
}
export {
  $pull
};
