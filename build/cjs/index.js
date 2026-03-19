var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var index_exports = {};
__export(index_exports, {
  Aggregator: () => Aggregator,
  Context: () => import_core.Context,
  ProcessingMode: () => import_core.ProcessingMode,
  Query: () => Query,
  aggregate: () => aggregate,
  default: () => index_default,
  find: () => find,
  update: () => update,
  updateMany: () => updateMany,
  updateOne: () => updateOne
});
module.exports = __toCommonJS(index_exports);
var import_aggregator = require("./aggregator");
var import_internal = require("./core/_internal");
var accumulatorOperators = __toESM(require("./operators/accumulator"));
var expressionOperators = __toESM(require("./operators/expression"));
var pipelineOperators = __toESM(require("./operators/pipeline"));
var projectionOperators = __toESM(require("./operators/projection"));
var queryOperators = __toESM(require("./operators/query"));
var windowOperators = __toESM(require("./operators/window"));
var import_query = require("./query");
var updater = __toESM(require("./updater"));
var import_core = require("./core");
const CONTEXT = import_internal.Context.init({
  accumulator: accumulatorOperators,
  expression: expressionOperators,
  pipeline: pipelineOperators,
  projection: projectionOperators,
  query: queryOperators,
  window: windowOperators
});
const makeOpts = (options) => Object.assign({
  ...options,
  context: options?.context ? import_internal.Context.from(CONTEXT, options?.context) : CONTEXT
});
class Query extends import_query.Query {
  constructor(condition, options) {
    super(condition, makeOpts(options));
  }
}
class Aggregator extends import_aggregator.Aggregator {
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
  Context: import_internal.Context,
  ProcessingMode: import_internal.ProcessingMode,
  Query,
  aggregate,
  find,
  update,
  updateMany,
  updateOne
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Aggregator,
  Context,
  ProcessingMode,
  Query,
  aggregate,
  find,
  update,
  updateMany,
  updateOne
});
