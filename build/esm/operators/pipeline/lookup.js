import { Aggregator } from "../../aggregator";
import { ComputeOptions, evalExpr } from "../../core/_internal";
import {
  assert,
  ensureArray,
  flatten,
  HashMap,
  isArray,
  isString,
  resolve
} from "../../util";
import { filterDocumentsStage, resolveCollection } from "./_internal";
function $lookup(coll, expr, options) {
  const { let: letExpr, foreignField, localField } = expr;
  let lookupEq = (_) => [true, []];
  let joinColl = isString(expr.from) ? resolveCollection("$lookup", expr.from, options) : expr.from;
  const { documents, pipeline } = filterDocumentsStage(
    expr.pipeline ?? [],
    options
  );
  assert(
    !joinColl !== !documents,
    "$lookup: must specify single join input with `expr.from` or `expr.pipeline`."
  );
  joinColl = joinColl ?? documents;
  assert(
    isArray(joinColl),
    "$lookup: join collection must resolve to an array."
  );
  if (foreignField && localField) {
    const map = HashMap.init();
    for (const doc of joinColl) {
      ensureArray(resolve(doc, foreignField) ?? null).forEach((v) => {
        const xs = map.get(v);
        const arr = xs ?? [];
        arr.push(doc);
        if (arr !== xs) map.set(v, arr);
      });
    }
    lookupEq = (o) => {
      const local = resolve(o, localField) ?? null;
      if (isArray(local)) {
        if (pipeline.length) {
          return [local.some((v) => map.has(v)), []];
        }
        const result2 = Array.from(new Set(flatten(local.map((v) => map.get(v)))));
        return [result2.length > 0, result2];
      }
      const result = map.get(local) ?? null;
      return [result !== null, result ?? []];
    };
    if (pipeline.length === 0) {
      return coll.map((obj) => {
        return { ...obj, [expr.as]: lookupEq(obj).pop() };
      });
    }
  }
  const agg = new Aggregator(pipeline, options);
  const opts = ComputeOptions.init(options);
  return coll.map((obj) => {
    const vars = evalExpr(obj, letExpr, options);
    opts.update({ root: null, variables: vars });
    const [ok, res] = lookupEq(obj);
    return { ...obj, [expr.as]: ok ? agg.run(joinColl, opts) : res };
  });
}
export {
  $lookup
};
