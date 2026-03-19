var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var internal_exports = {};
__export(internal_exports, {
  filterDocumentsStage: () => filterDocumentsStage,
  resolveCollection: () => resolveCollection,
  validateProjection: () => validateProjection
});
module.exports = __toCommonJS(internal_exports);
var import_lazy = require("../../lazy");
var import_util = require("../../util");
var import_internal = require("../../util/_internal");
var import_documents = require("./documents");
const EMPTY = (0, import_lazy.Lazy)([]);
function filterDocumentsStage(pipeline, options) {
  if (!pipeline) return {};
  const docs = pipeline[0]?.$documents;
  if (!docs) return { pipeline };
  return {
    documents: (0, import_documents.$documents)(EMPTY, docs, options).collect(),
    pipeline: pipeline.slice(1)
  };
}
function validateProjection(expr, options, isRoot = true) {
  const res = {
    exclusions: [],
    inclusions: [],
    positional: 0
  };
  const keys = Object.keys(expr);
  (0, import_internal.assert)(keys.length, "Invalid empty sub-projection");
  const idKey = options?.idKey;
  let idKeyExcluded = false;
  for (const k of keys) {
    if (k.startsWith("$")) {
      (0, import_internal.assert)(
        !isRoot && keys.length === 1,
        `FieldPath field names may not start with '$', given '${k}'.`
      );
      return res;
    }
    if (k.endsWith(".$")) res.positional++;
    const v = expr[k];
    if (v === false || (0, import_util.isNumber)(v) && v === 0) {
      if (k === idKey) {
        idKeyExcluded = true;
      } else res.exclusions.push(k);
    } else if (!(0, import_util.isObject)(v)) {
      res.inclusions.push(k);
    } else {
      const s = validateProjection(v, options, false);
      if (!s.inclusions.length && !s.exclusions.length) {
        if (!res.inclusions.includes(k)) res.inclusions.push(k);
      } else {
        s.inclusions.forEach((s2) => res.inclusions.push(`${k}.${s2}`));
        s.exclusions.forEach((s2) => res.exclusions.push(`${k}.${s2}`));
      }
      res.positional += s.positional;
    }
    (0, import_internal.assert)(
      !(res.exclusions.length && res.inclusions.length),
      "Cannot do exclusion and inclusion in projection."
    );
    (0, import_internal.assert)(
      res.positional <= 1,
      "Cannot specify more than one positional projection."
    );
  }
  if (idKeyExcluded) {
    res.exclusions.push(idKey);
  }
  if (isRoot) {
    const p = new import_internal.PathValidator();
    res.exclusions.forEach((k) => (0, import_internal.assert)(p.add(k), `Path collision at ${k}.`));
    res.inclusions.forEach((k) => (0, import_internal.assert)(p.add(k), `Path collision at ${k}.`));
    res.exclusions.sort();
    res.inclusions.sort();
  }
  return res;
}
function resolveCollection(op, expr, options) {
  if ((0, import_internal.isString)(expr)) {
    (0, import_internal.assert)(
      options.collectionResolver,
      `${op} requires 'collectionResolver' option to resolve named collection`
    );
  }
  const coll = (0, import_internal.isString)(expr) ? options.collectionResolver(expr) : expr;
  (0, import_internal.assert)((0, import_internal.isArray)(coll), `${op} could not resolve input collection`);
  return coll;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  filterDocumentsStage,
  resolveCollection,
  validateProjection
});
