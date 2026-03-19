import { assert, isNumber, isObject } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";
const BIT_OPS = ["and", "or", "xor"];
function $bit(expr, arrayFilters = [], options = DEFAULT_OPTIONS) {
  for (const vals of Object.values(expr)) {
    assert(isObject(vals), `$bit operator expression must be an object.`);
    const op = Object.keys(vals);
    assert(
      op.length === 1 && BIT_OPS.includes(op[0]),
      `$bit spec is invalid '${op[0]}'. Must be one of 'and', 'or', or 'xor'.`
    );
    assert(
      isNumber(vals[op[0]]),
      `$bit expression value must be a number. Got ${typeof vals[op[0]]}`
    );
  }
  return (obj) => {
    return walkExpression(
      expr,
      arrayFilters,
      options,
      (val, node, queries) => {
        const op = Object.keys(val);
        return applyUpdate(
          obj,
          node,
          queries,
          (o, k) => {
            let n = o[k];
            const v = val[op[0]];
            if (n !== void 0 && !(isNumber(n) && isNumber(v))) return false;
            n = n || 0;
            switch (op[0]) {
              case "and":
                return (o[k] = n & v) !== n;
              case "or":
                return (o[k] = n | v) !== n;
              case "xor":
                return (o[k] = n ^ v) !== n;
            }
          },
          { buildGraph: true }
        );
      }
    );
  };
}
export {
  $bit
};
