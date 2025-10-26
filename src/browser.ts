import { AggregatorImpl } from "./aggregator/_internal";
import { CloneMode, ComputeOptions, Context, Options } from "./core/_internal";
import { Cursor } from "./cursor";
import type { Source } from "./lazy";
import * as accumulatorOperators from "./operators/accumulator";
import * as expressionOperators from "./operators/expression";
import * as pipelineOperators from "./operators/pipeline";
import * as projectionOperators from "./operators/projection";
import * as queryOperators from "./operators/query";
import * as windowOperators from "./operators/window";
import { QueryImpl } from "./query/_internal";
import type { AnyObject } from "./types";
import * as updater from "./updater";

export { Context, ProcessingMode } from "./core";

const CONTEXT = Context.init()
  .addAccumulatorOps(accumulatorOperators)
  .addExpressionOps(expressionOperators)
  .addPipelineOps(pipelineOperators)
  .addProjectionOps(projectionOperators)
  .addQueryOps(queryOperators)
  .addWindowOps(windowOperators);

const makeOpts = (options?: Partial<Options>) => {
  return ComputeOptions.init({
    ...options,
    context: options?.context
      ? Context.merge(CONTEXT, options?.context)
      : CONTEXT
  });
};

export class Query extends QueryImpl {
  constructor(condition: AnyObject, options?: Partial<Options>) {
    super(condition, makeOpts(options));
  }
}

export class Aggregator extends AggregatorImpl {
  constructor(pipeline: AnyObject[], options?: Partial<Options>) {
    super(pipeline, makeOpts(options));
  }
}

export const aggregate = (
  collection: Source,
  pipeline: AnyObject[],
  options?: Partial<Options>
): AnyObject[] => new Aggregator(pipeline, options).run(collection);

export const find = <T>(
  collection: Source,
  criteria: AnyObject,
  projection?: AnyObject,
  options?: Partial<Options>
): Cursor<T> => new Query(criteria, options).find<T>(collection, projection);

export const update = (
  obj: AnyObject,
  updateExpr: updater.UpdateExpression,
  arrayFilters?: AnyObject[],
  condition?: AnyObject,
  options?: {
    cloneMode?: CloneMode;
    queryOptions?: Partial<Options>;
  }
) => {
  return updater.update(obj, updateExpr, arrayFilters, condition, {
    cloneMode: options?.cloneMode,
    queryOptions: makeOpts(options?.queryOptions)
  });
};

export const updateMany = (
  documents: AnyObject[],
  condition: AnyObject,
  updateExpr: updater.UpdateExpression | updater.PipelineStage[],
  updateConfig: updater.UpdateConfig = {},
  options?: Partial<Options>
): { matchedCount: number; modifiedCount: number } => {
  return updater.updateMany(
    documents,
    condition,
    updateExpr,
    updateConfig,
    makeOpts(options)
  );
};

export const updateOne = (
  documents: AnyObject[],
  condition: AnyObject,
  updateExpr: updater.UpdateExpression | updater.PipelineStage[],
  updateConfig: updater.UpdateConfig = {},
  options?: Partial<Options>
): { matchedCount: number; modifiedCount: number } => {
  return updater.updateOne(
    documents,
    condition,
    updateExpr,
    updateConfig,
    makeOpts(options)
  );
};
