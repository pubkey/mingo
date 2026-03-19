import { assert, has } from "../../util";
import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";
import { $set } from "./set";
const isIdPath = (path, idKey) => path === idKey || path.startsWith(`${idKey}.`);
function $rename(expr, arrayFilters = [], options = DEFAULT_OPTIONS) {
  const idKey = options.idKey;
  for (const target of Object.values(expr)) {
    assert(
      !isIdPath(target, idKey),
      `Performing an update on the path '${target}' would modify the immutable field '${idKey}'.`
    );
  }
  return (obj) => {
    const res = [];
    const changed = walkExpression(
      expr,
      arrayFilters,
      options,
      (val, node, queries) => {
        return applyUpdate(obj, node, queries, (o, k) => {
          if (!has(o, k)) return false;
          Array.prototype.push.apply(
            res,
            $set({ [val]: o[k] }, arrayFilters, options)(obj)
          );
          delete o[k];
          return true;
        });
      }
    );
    return Array.from(new Set(changed.concat(res)));
  };
}
export {
  $rename
};
