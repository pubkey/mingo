import { evalExpr } from "../../core/_internal";
import { Lazy } from "../../lazy";
import { assert, compare, findInsertIndex, isNil, typeOf } from "../../util";
function $bucket(coll, expr, options) {
  const bounds = expr.boundaries.slice();
  const defaultKey = expr.default;
  const lower = bounds[0];
  const upper = bounds[bounds.length - 1];
  const outputExpr = expr.output || { count: { $sum: 1 } };
  assert(bounds.length > 1, "$bucket: must specify at least two boundaries.");
  const isValid = bounds.every(
    (v, i) => i === 0 || typeOf(v) === typeOf(bounds[i - 1]) && compare(v, bounds[i - 1]) > 0
  );
  assert(
    isValid,
    `$bucket: bounds must be of same type and in ascending order`
  );
  assert(
    isNil(defaultKey) || typeOf(defaultKey) !== typeOf(lower) || compare(defaultKey, upper) >= 0 || compare(defaultKey, lower) < 0,
    "$bucket: 'default' expression must be out of boundaries range"
  );
  const createBuckets = () => {
    const buckets = /* @__PURE__ */ new Map();
    for (let i = 0; i < bounds.length - 1; i++) {
      buckets.set(bounds[i], []);
    }
    if (!isNil(defaultKey)) buckets.set(defaultKey, []);
    coll.each((obj) => {
      const key = evalExpr(obj, expr.groupBy, options);
      if (isNil(key) || compare(key, lower) < 0 || compare(key, upper) >= 0) {
        assert(
          !isNil(defaultKey),
          "$bucket require a default for out of range values"
        );
        buckets.get(defaultKey)?.push(obj);
      } else {
        assert(
          compare(key, lower) >= 0 && compare(key, upper) < 0,
          "$bucket 'groupBy' expression must resolve to a value in range of boundaries"
        );
        const index = findInsertIndex(bounds, key);
        const boundKey = bounds[Math.max(0, index - 1)];
        buckets.get(boundKey)?.push(obj);
      }
    });
    bounds.pop();
    if (!isNil(defaultKey)) {
      if (buckets.get(defaultKey)?.length) bounds.push(defaultKey);
      else buckets.delete(defaultKey);
    }
    assert(
      buckets.size === bounds.length,
      "bounds and groups must be of equal size."
    );
    return Lazy(bounds).map((key) => {
      return {
        ...evalExpr(buckets.get(key), outputExpr, options),
        _id: key
      };
    });
  };
  let iterator;
  return Lazy(() => {
    if (!iterator) iterator = createBuckets();
    return iterator.next();
  });
}
export {
  $bucket
};
