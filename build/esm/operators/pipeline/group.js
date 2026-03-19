import { ComputeOptions, evalExpr } from "../../core/_internal";
import { Lazy } from "../../lazy";
import { assert, groupBy, has } from "../../util";
const ID_KEY = "_id";
function $group(coll, expr, options) {
  assert(has(expr, ID_KEY), "$group specification must include an '_id'");
  const idExpr = expr[ID_KEY];
  const copts = ComputeOptions.init(options);
  const newFields = Object.keys(expr).filter((k) => k != ID_KEY);
  return coll.transform((coll2) => {
    const partitions = groupBy(coll2, (obj) => evalExpr(obj, idExpr, options));
    let i = -1;
    const partitionKeys = Array.from(partitions.keys());
    return Lazy(() => {
      if (++i === partitions.size) return { done: true };
      const groupId = partitionKeys[i];
      const obj = {};
      if (groupId !== void 0) {
        obj[ID_KEY] = groupId;
      }
      for (const key of newFields) {
        obj[key] = evalExpr(
          partitions.get(groupId),
          expr[key],
          copts.update({ root: null, groupId })
        );
      }
      return { value: obj, done: false };
    });
  });
}
export {
  $group
};
