import { ComputeOptions } from "./core/_internal";
import { Lazy } from "./lazy";
import * as booleanOperators from "./operators/expression/boolean";
import * as comparisonOperators from "./operators/expression/comparison";
import { $addFields } from "./operators/pipeline/addFields";
import { $project } from "./operators/pipeline/project";
import { $replaceRoot } from "./operators/pipeline/replaceRoot";
import { $replaceWith } from "./operators/pipeline/replaceWith";
import { $set } from "./operators/pipeline/set";
import { $sort } from "./operators/pipeline/sort";
import { $unset } from "./operators/pipeline/unset";
import * as queryOperators from "./operators/query";
import * as updateOperators from "./operators/update";
import { buildParams } from "./operators/update/_internal";
import { Query } from "./query";
import {
  assert,
  cloneDeep,
  ensureArray,
  hashCode,
  isArray,
  isEqual,
  PathValidator,
  resolve
} from "./util/_internal";
const UPDATE_OPERATORS = updateOperators;
const PIPELINE_OPERATORS = {
  $addFields,
  $set,
  $project,
  $unset,
  $replaceRoot,
  $replaceWith
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
  const opts = ComputeOptions.init({
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
  let docsIter = Lazy(documents);
  if (filterExists) {
    const query = new Query(condition, opts);
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
      docsIter = $sort(docsIter, updateConfig.sort, opts);
    }
    docsIter = docsIter.take(1);
    const firstDoc = docsIter.collect()[0];
    modifiedIndex = matchedDocs.get(firstDoc) ?? indexes.get(firstDoc) ?? 0;
  }
  const foundDocs = docsIter.collect();
  if (foundDocs.length === 0) return { matchedCount: 0, modifiedCount: 0 };
  if (isArray(modifier)) {
    const indexes = firstOnly ? [modifiedIndex] : Array.from(matchedDocs.values());
    const hashes = indexes.length ? indexes.map((i) => hashCode(documents[i])) : foundDocs.map((o) => hashCode(o));
    const output2 = { matchedCount: hashes.length, modifiedCount: 0 };
    const oldFirstDoc = firstOnly ? cloneDeep(documents[indexes[0]]) : void 0;
    let updateIter = Lazy(foundDocs);
    for (const stage of modifier) {
      const [op, expr] = Object.entries(stage)[0];
      const pipelineOp = PIPELINE_OPERATORS[op];
      assert(pipelineOp, `Unknown pipeline operator: '${op}'.`);
      updateIter = pipelineOp(updateIter, expr, opts);
    }
    const matches = updateIter.collect();
    if (indexes.length) {
      assert(
        indexes.length === matches.length,
        "bug: indexes and result size must match."
      );
      for (let i = 0; i < indexes.length; i++) {
        if (hashCode(matches[i]) !== hashes[i]) {
          documents[indexes[i]] = matches[i];
          output2.modifiedCount++;
        }
      }
    } else {
      for (let i = 0; i < documents.length; i++) {
        if (hashCode(matches[i]) !== hashes[i]) {
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
      assert(modifiedFields2.length, "bug: failed to retrieve modified fields");
      Object.assign(output2, { modifiedFields: modifiedFields2, modifiedIndex });
    }
    return output2;
  }
  const unknownOp = Object.keys(modifier).find((op) => !UPDATE_OPERATORS[op]);
  assert(!unknownOp, `Unknown update operator: '${unknownOp}'.`);
  const arrayFilters = updateConfig?.arrayFilters ?? [];
  opts.update({
    updateParams: buildParams(
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
        stageFields.push(...ensureArray(expr));
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
  const pathValidator = new PathValidator();
  const modifiedFields = [];
  for (const key of stageFieldsSet) {
    if (pathValidator.add(key) && !isEqual(resolve(newDoc, key), resolve(oldDoc, key))) {
      modifiedFields.push(key);
    }
  }
  for (const key of Object.keys(oldDoc)) {
    if (stageFieldsSet.has(key)) continue;
    if (!pathValidator.add(key) || !isEqual(newDoc[key], oldDoc[key])) {
      modifiedFields.push(key);
    }
  }
  const topLevelValidator = new PathValidator();
  return modifiedFields.sort().filter((key) => topLevelValidator.add(key));
}
export {
  update,
  updateMany,
  updateOne
};
