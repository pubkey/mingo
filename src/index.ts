import { Aggregator as AggregatorBase } from "./aggregator";
import { Context, Options, ProcessingMode } from "./core/_internal";
import { Cursor } from "./cursor";
import type { Source } from "./lazy";
import * as accumulatorOperators from "./operators/accumulator";
import * as expressionOperators from "./operators/expression";
import * as pipelineOperators from "./operators/pipeline";
import * as projectionOperators from "./operators/projection";
import * as queryOperators from "./operators/query";
import * as windowOperators from "./operators/window";
import { Query as QueryBase } from "./query";
import type { AnyObject } from "./types";
import * as updater from "./updater";

export { Context, ProcessingMode } from "./core";

const CONTEXT = Context.init({
  accumulator: accumulatorOperators,
  expression: expressionOperators,
  pipeline: pipelineOperators,
  projection: projectionOperators,
  query: queryOperators,
  window: windowOperators
});

const makeOpts = (options?: Partial<Options>) =>
  Object.assign({
    ...options,
    context: options?.context
      ? Context.merge(CONTEXT, options?.context)
      : CONTEXT
  }) as Options;

export class Query extends QueryBase {
  constructor(condition: AnyObject, options?: Partial<Options>) {
    super(condition, makeOpts(options));
  }
}

export class Aggregator extends AggregatorBase {
  constructor(pipeline: AnyObject[], options?: Partial<Options>) {
    super(pipeline, makeOpts(options));
  }
}

/**
 * Finds documents in a collection that match the specified criteria.
 *
 * @template T - The type of the documents in the collection.
 * @param collection - The source collection to search.
 * @param condition - The query criteria to filter the documents.
 * @param projection - Optional. Specifies the fields to include or exclude in the returned documents.
 * @param options - Optional. Additional options to customize the query behavior.
 * @returns A `Cursor` object that allows iteration over the matching documents.
 */
export function find<T>(
  collection: Source,
  condition: AnyObject,
  projection?: AnyObject,
  options?: Partial<Options>
): Cursor<T> {
  return new Query(condition, makeOpts(options)).find<T>(
    collection,
    projection
  );
}

/**
 * Performs an aggregation operation on the provided collection using the specified pipeline.
 *
 * @param collection - The input data source to aggregate.
 * @param pipeline - An array of aggregation stages to process the collection.
 * @param options - Optional settings to customize the aggregation behavior.
 * @returns The result of the aggregation as an array of objects.
 */
export function aggregate(
  collection: Source,
  pipeline: AnyObject[],
  options?: Partial<Options>
): AnyObject[] {
  return new Aggregator(pipeline, makeOpts(options)).run(collection);
}

export function update(
  obj: AnyObject,
  modifier: updater.Modifier,
  arrayFilters?: AnyObject[],
  condition?: AnyObject,
  options?: {
    cloneMode?: updater.CloneMode;
    queryOptions?: Partial<Options>;
  }
) {
  return updater.update(obj, modifier, arrayFilters, condition, {
    cloneMode: options?.cloneMode,
    queryOptions: makeOpts(options?.queryOptions)
  });
}

export function updateMany(
  documents: AnyObject[],
  condition: AnyObject,
  modifer: updater.Modifier | updater.PipelineStage[],
  updateConfig: updater.UpdateConfig = {},
  options?: Partial<Options>
) {
  return updater.updateMany(
    documents,
    condition,
    modifer,
    updateConfig,
    makeOpts(options)
  );
}

export function updateOne(
  documents: AnyObject[],
  condition: AnyObject,
  modifier: updater.Modifier | updater.PipelineStage[],
  updateConfig: updater.UpdateConfig = {},
  options?: Partial<Options>
) {
  return updater.updateOne(
    documents,
    condition,
    modifier,
    updateConfig,
    makeOpts(options)
  );
}

export default {
  Aggregator,
  Context,
  ProcessingMode,
  Query,
  aggregate,
  find,
  update,
  updateMany,
  updateOne
};
