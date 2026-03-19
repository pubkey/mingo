import { Aggregator } from "../../aggregator";
import { concat, Lazy } from "../../lazy";
import { assert, isArray, isString } from "../../util";
import { filterDocumentsStage, resolveCollection } from "./_internal";
function $unionWith(collection, expr, options) {
  const { coll: inputColl, pipeline: stages } = isString(expr) || isArray(expr) ? { coll: expr } : expr;
  const docsFromInput = isString(inputColl) ? resolveCollection("$unionWith", inputColl, options) : inputColl;
  const { documents, pipeline } = filterDocumentsStage(stages, options);
  assert(
    docsFromInput || documents,
    "$unionWith must specify single collection input with `expr.coll` or `expr.pipeline`."
  );
  const xs = docsFromInput ?? documents;
  return concat(
    collection,
    pipeline ? new Aggregator(pipeline, options).stream(xs) : Lazy(xs)
  );
}
export {
  $unionWith
};
