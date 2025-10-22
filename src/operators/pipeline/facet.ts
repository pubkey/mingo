import { AggregatorImpl } from "../../aggregator/_internal";
import {
  ComputeOptions,
  Options,
  PipelineOperator,
  ProcessingMode
} from "../../core/_internal";
import { Iterator } from "../../lazy";
import { AnyObject, Callback } from "../../types";
/**
 * Processes multiple aggregation pipelines within a single stage on the same set of input documents.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/facet usage}.
 *
 * @param collection
 * @param expr
 * @param options
 * @returns
 */
export const $facet: PipelineOperator = (
  collection: Iterator,
  expr: Record<string, AnyObject[]>,
  options: Options
): Iterator => {
  if (!(options.processingMode & ProcessingMode.CLONE_INPUT)) {
    options = {
      ...ComputeOptions.init(options).options,
      processingMode: ProcessingMode.CLONE_INPUT
    };
  }
  return collection.transform(((array: AnyObject[]) => {
    const o: AnyObject = {};
    for (const [k, pipeline] of Object.entries(expr)) {
      o[k] = new AggregatorImpl(pipeline, options).run(array);
    }
    return [o];
  }) as Callback<AnyObject[]>);
};
