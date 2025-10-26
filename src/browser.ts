import { Aggregator } from "./aggregator";
import { CloneMode, ComputeOptions, Context, Options } from "./core/_internal";
import { Cursor } from "./cursor";
import fullContext from "./init/context";
import { Source } from "./lazy";
import { QueryImpl } from "./query/_internal";
import { AnyObject } from "./types";
import * as updater from "./updater";

export { Aggregator } from "./aggregator";
export { Context, ProcessingMode } from "./core";

const CONTEXT = fullContext();

export class Query extends QueryImpl {
  constructor(condition: AnyObject, options?: Partial<Options>) {
    super(
      condition,
      ComputeOptions.init({
        ...options,
        context: options?.context
          ? Context.merge(CONTEXT, options?.context)
          : CONTEXT
      })
    );
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
  const context = options?.queryOptions?.context;
  return updater.update(obj, updateExpr, arrayFilters, condition, {
    cloneMode: options?.cloneMode,
    queryOptions: {
      ...options?.queryOptions,
      context: context ? Context.merge(CONTEXT, context) : CONTEXT
    }
  });
};

export const updateMany = (
  documents: AnyObject[],
  condition: AnyObject,
  updateExpr: updater.UpdateExpression | updater.PipelineStage[],
  updateConfig: updater.UpdateConfig = {},
  options?: Partial<Options>
): { matchedCount: number; modifiedCount: number } => {
  const context = options?.context;
  return updater.updateMany(documents, condition, updateExpr, updateConfig, {
    ...options,
    context: context ? Context.merge(CONTEXT, context) : CONTEXT
  });
};

export const updateOne = (
  documents: AnyObject[],
  condition: AnyObject,
  updateExpr: updater.UpdateExpression | updater.PipelineStage[],
  updateConfig: updater.UpdateConfig = {},
  options?: Partial<Options>
): { matchedCount: number; modifiedCount: number } => {
  const context = options?.context;
  return updater.updateOne(documents, condition, updateExpr, updateConfig, {
    ...options,
    context: context ? Context.merge(CONTEXT, context) : CONTEXT
  });
};
