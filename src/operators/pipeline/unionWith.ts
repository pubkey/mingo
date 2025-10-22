import { AggregatorImpl } from "../../aggregator/_internal";
import { Options, PipelineOperator } from "../../core/_internal";
import { concat, Iterator, Lazy } from "../../lazy";
import { AnyObject } from "../../types";
import { assert, isArray, isString } from "../../util";
import { filterDocumentsStage } from "./_internal";

interface InputExpr {
  readonly coll: string | AnyObject[];
  readonly pipeline?: AnyObject[];
}

/**
 * Combines two aggregations into a single result set.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/unionWith usage}.
 *
 * @param collection
 * @param expr
 * @param opt
 */
export const $unionWith: PipelineOperator = (
  collection: Iterator,
  expr: InputExpr | string | AnyObject[],
  options: Options
): Iterator => {
  const { coll, pipeline: p } =
    isString(expr) || isArray(expr) ? { coll: expr } : expr;
  const arr = isString(coll) ? options.collectionResolver(coll) : coll;
  const { documents, pipeline } = filterDocumentsStage(p ?? [], options);
  assert(
    !arr !== !documents,
    "$unionWith: must specify single collection input with `expr.coll` or `expr.pipeline`."
  );

  const xs = arr ?? documents;

  return concat(
    collection,
    pipeline ? new AggregatorImpl(pipeline, options).stream(xs) : Lazy(xs)
  );
};
