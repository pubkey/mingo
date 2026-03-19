import { Aggregator as AggregatorBase } from "./aggregator";
import { Context, ProcessingMode } from "./core/_internal";
import * as accumulatorOperators from "./operators/accumulator";
import * as expressionOperators from "./operators/expression";
import * as pipelineOperators from "./operators/pipeline";
import * as projectionOperators from "./operators/projection";
import * as queryOperators from "./operators/query";
import * as windowOperators from "./operators/window";
import { Query as QueryBase } from "./query";
import * as updater from "./updater";
import { Context as Context2, ProcessingMode as ProcessingMode2 } from "./core";
const CONTEXT = Context.init({
  accumulator: accumulatorOperators,
  expression: expressionOperators,
  pipeline: pipelineOperators,
  projection: projectionOperators,
  query: queryOperators,
  window: windowOperators
});
const makeOpts = (options) => Object.assign({
  ...options,
  context: options?.context ? Context.from(CONTEXT, options?.context) : CONTEXT
});
class Query extends QueryBase {
  constructor(condition, options) {
    super(condition, makeOpts(options));
  }
}
class Aggregator extends AggregatorBase {
  constructor(pipeline, options) {
    super(pipeline, makeOpts(options));
  }
}
function find(collection, condition, projection, options) {
  return new Query(condition, makeOpts(options)).find(
    collection,
    projection
  );
}
function aggregate(collection, pipeline, options) {
  return new Aggregator(pipeline, makeOpts(options)).run(collection);
}
function update(obj, modifier, arrayFilters, condition, options) {
  return updater.update(obj, modifier, arrayFilters, condition, {
    cloneMode: options?.cloneMode,
    queryOptions: makeOpts(options?.queryOptions)
  });
}
function updateMany(documents, condition, modifer, updateConfig = {}, options) {
  return updater.updateMany(
    documents,
    condition,
    modifer,
    updateConfig,
    makeOpts(options)
  );
}
function updateOne(documents, condition, modifier, updateConfig = {}, options) {
  return updater.updateOne(
    documents,
    condition,
    modifier,
    updateConfig,
    makeOpts(options)
  );
}
var index_default = {
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
export {
  Aggregator,
  Context2 as Context,
  ProcessingMode2 as ProcessingMode,
  Query,
  aggregate,
  index_default as default,
  find,
  update,
  updateMany,
  updateOne
};
