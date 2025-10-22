import { Options, PipelineOperator } from "../../core/_internal";
import { Iterator, Lazy } from "../../lazy";
import { assert, isEmpty, isString } from "../../util";

/**
 * Returns a count of the number of documents at this stage of the aggregation pipeline.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/count usage}.
 *
 * @param collection
 * @param expr
 * @param _options
 * @returns
 */
export const $count: PipelineOperator = (
  collection: Iterator,
  expr: string,
  _options: Options
): Iterator => {
  assert(
    isString(expr) &&
      !isEmpty(expr) &&
      expr.indexOf(".") === -1 &&
      expr.trim()[0] !== "$",
    "Invalid expression value for $count"
  );

  return Lazy([
    {
      [expr]: collection.size()
    }
  ]);
};
