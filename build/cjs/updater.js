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
var updater_exports = {};
__export(updater_exports, {
  update: () => update,
  updateMany: () => updateMany,
  updateOne: () => updateOne
});
module.exports = __toCommonJS(updater_exports);
var import_internal = require("./core/_internal");
var import_lazy = require("./lazy");
var booleanOperators = __toESM(require("./operators/expression/boolean"));
var comparisonOperators = __toESM(require("./operators/expression/comparison"));
var import_addFields = require("./operators/pipeline/addFields");
var import_project = require("./operators/pipeline/project");
var import_replaceRoot = require("./operators/pipeline/replaceRoot");
var import_replaceWith = require("./operators/pipeline/replaceWith");
var import_set = require("./operators/pipeline/set");
var import_sort = require("./operators/pipeline/sort");
var import_unset = require("./operators/pipeline/unset");
var queryOperators = __toESM(require("./operators/query"));
var updateOperators = __toESM(require("./operators/update"));
var import_internal2 = require("./operators/update/_internal");
var import_query = require("./query");
var import_internal3 = require("./util/_internal");
const UPDATE_OPERATORS = updateOperators;
const PIPELINE_OPERATORS = {
  $addFields: import_addFields.$addFields,
  $set: import_set.$set,
  $project: import_project.$project,
  $unset: import_unset.$unset,
  $replaceRoot: import_replaceRoot.$replaceRoot,
  $replaceWith: import_replaceWith.$replaceWith
};
function update(obj, modifier, arrayFilters, condition, options) {
  const docs = [obj];
  const res = updateOne(
    docs,
    condition || {},
    modifier,
    { arrayFilters, cloneMode: options?.cloneMode ?? "copy" },
    options?.queryOptions
  );
  return res.modifiedFields ?? [];
}
function updateMany(documents, condition, modifier, updateConfig = {}, options) {
  const { modifiedCount, matchedCount } = updateDocuments(
    documents,
    condition,
    modifier,
    updateConfig,
    options
  );
  return { modifiedCount, matchedCount };
}
function updateOne(documents, condition, modifier, updateConfig = {}, options) {
  return updateDocuments(documents, condition, modifier, updateConfig, {
    ...options,
    firstOnly: true
  });
}
function updateDocuments(documents, condition, modifier, updateConfig = {}, options) {
  options ||= {};
  const firstOnly = options?.firstOnly ?? false;
  const opts = import_internal.ComputeOptions.init({
    ...options,
    collation: Object.assign({}, options?.collation, updateConfig?.collation)
  }).update({
    condition,
    updateConfig: { cloneMode: "copy", ...updateConfig },
    variables: updateConfig.let,
    updateParams: {}
  });
  opts.context.addExpressionOps(booleanOperators).addExpressionOps(comparisonOperators).addQueryOps(queryOperators).addPipelineOps(PIPELINE_OPERATORS);
  const filterExists = Object.keys(condition).length > 0;
  const matchedDocs = /* @__PURE__ */ new Map();
  let docsIter = (0, import_lazy.Lazy)(documents);
  if (filterExists) {
    const query = new import_query.Query(condition, opts);
    docsIter = docsIter.filter((o, i) => {
      if (query.test(o)) {
        matchedDocs.set(o, i);
        return true;
      }
      return false;
    });
  }
  let modifiedIndex = -1;
  if (firstOnly) {
    const indexes = /* @__PURE__ */ new Map();
    if (updateConfig.sort) {
      if (!filterExists) {
        docsIter = docsIter.map((o, i) => {
          indexes.set(o, i);
          return o;
        });
      }
      docsIter = (0, import_sort.$sort)(docsIter, updateConfig.sort, opts);
    }
    docsIter = docsIter.take(1);
    const firstDoc = docsIter.collect()[0];
    modifiedIndex = matchedDocs.get(firstDoc) ?? indexes.get(firstDoc) ?? 0;
  }
  const foundDocs = docsIter.collect();
  if (foundDocs.length === 0) return { matchedCount: 0, modifiedCount: 0 };
  if ((0, import_internal3.isArray)(modifier)) {
    const indexes = firstOnly ? [modifiedIndex] : Array.from(matchedDocs.values());
    const hashes = indexes.length ? indexes.map((i) => (0, import_internal3.hashCode)(documents[i])) : foundDocs.map((o) => (0, import_internal3.hashCode)(o));
    const output2 = { matchedCount: hashes.length, modifiedCount: 0 };
    const oldFirstDoc = firstOnly ? (0, import_internal3.cloneDeep)(documents[indexes[0]]) : void 0;
    let updateIter = (0, import_lazy.Lazy)(foundDocs);
    for (const stage of modifier) {
      const [op, expr] = Object.entries(stage)[0];
      const pipelineOp = PIPELINE_OPERATORS[op];
      (0, import_internal3.assert)(pipelineOp, `Unknown pipeline operator: '${op}'.`);
      updateIter = pipelineOp(updateIter, expr, opts);
    }
    const matches = updateIter.collect();
    if (indexes.length) {
      (0, import_internal3.assert)(
        indexes.length === matches.length,
        "bug: indexes and result size must match."
      );
      for (let i = 0; i < indexes.length; i++) {
        if ((0, import_internal3.hashCode)(matches[i]) !== hashes[i]) {
          documents[indexes[i]] = matches[i];
          output2.modifiedCount++;
        }
      }
    } else {
      for (let i = 0; i < documents.length; i++) {
        if ((0, import_internal3.hashCode)(matches[i]) !== hashes[i]) {
          documents[i] = matches[i];
          output2.modifiedCount++;
        }
      }
    }
    if (firstOnly && output2.modifiedCount && oldFirstDoc) {
      const newDoc = documents[indexes[0]];
      const modifiedFields2 = getModifiedFields(
        modifier,
        oldFirstDoc,
        newDoc
      );
      (0, import_internal3.assert)(modifiedFields2.length, "bug: failed to retrieve modified fields");
      Object.assign(output2, { modifiedFields: modifiedFields2, modifiedIndex });
    }
    return output2;
  }
  const unknownOp = Object.keys(modifier).find((op) => !UPDATE_OPERATORS[op]);
  (0, import_internal3.assert)(!unknownOp, `Unknown update operator: '${unknownOp}'.`);
  const arrayFilters = updateConfig?.arrayFilters ?? [];
  opts.update({
    updateParams: (0, import_internal2.buildParams)(
      Object.values(modifier),
      arrayFilters,
      opts
    )
  });
  const matchedCount = foundDocs.length;
  const output = { matchedCount, modifiedCount: 0 };
  const modifiedFields = [];
  const fns = [];
  for (const [op, expr] of Object.entries(modifier)) {
    const fn = UPDATE_OPERATORS[op];
    fns.push(fn(expr, arrayFilters, opts));
  }
  for (const doc of foundDocs) {
    let modified = false;
    for (const mutate of fns) {
      const fields = mutate(doc);
      if (fields.length) {
        modified = true;
        if (firstOnly) Array.prototype.push.apply(modifiedFields, fields);
      }
    }
    output.modifiedCount += +modified;
  }
  if (firstOnly && modifiedFields.length) {
    modifiedFields.sort();
    Object.assign(output, { modifiedFields, modifiedIndex });
  }
  return output;
}
function getModifiedFields(pipeline, oldDoc, newDoc) {
  const stageFields = [];
  for (const stage of pipeline) {
    const op = Object.keys(stage)[0];
    const expr = stage[op];
    switch (op) {
      case "$addFields":
      case "$set":
      case "$project":
      case "$replaceWith":
        stageFields.push(...Object.keys(expr));
        break;
      case "$unset":
        stageFields.push(...(0, import_internal3.ensureArray)(expr));
        break;
      case "$replaceRoot":
        stageFields.length = 0;
        stageFields.push(
          ...Object.keys(expr?.newRoot)
        );
        break;
    }
  }
  const stageFieldsSet = new Set(stageFields.sort());
  const pathValidator = new import_internal3.PathValidator();
  const modifiedFields = [];
  for (const key of stageFieldsSet) {
    if (pathValidator.add(key) && !(0, import_internal3.isEqual)((0, import_internal3.resolve)(newDoc, key), (0, import_internal3.resolve)(oldDoc, key))) {
      modifiedFields.push(key);
    }
  }
  for (const key of Object.keys(oldDoc)) {
    if (stageFieldsSet.has(key)) continue;
    if (!pathValidator.add(key) || !(0, import_internal3.isEqual)(newDoc[key], oldDoc[key])) {
      modifiedFields.push(key);
    }
  }
  const topLevelValidator = new import_internal3.PathValidator();
  return modifiedFields.sort().filter((key) => topLevelValidator.add(key));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  update,
  updateMany,
  updateOne
});
