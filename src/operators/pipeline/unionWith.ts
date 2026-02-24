import { Aggregator } from "../../aggregator";
import { concat, Iterator, Lazy } from "../../lazy";
import { AnyObject, Options } from "../../types";
import { assert, isArray, isString } from "../../util";
import { filterDocumentsStage, resolveCollection } from "./_internal";

interface InputExpr {
  readonly coll: string | AnyObject[];
  readonly pipeline?: AnyObject[];
}

/**
 * Combines two aggregations into a single result set.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/unionWith usage}.
 */
export function $unionWith(
  collection: Iterator,
  expr: InputExpr | string | AnyObject[],
  options: Options
): Iterator {
  const { coll: inputColl, pipeline: stages } =
    isString(expr) || isArray(expr) ? { coll: expr } : expr;
  const docsFromInput = isString(inputColl)
    ? resolveCollection("$unionWith", inputColl, options)
    : inputColl;
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
