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
var internal_exports = {};
__export(internal_exports, {
  DEFAULT_OPTIONS: () => DEFAULT_OPTIONS,
  applyUpdate: () => applyUpdate,
  buildParams: () => buildParams,
  clone: () => clone,
  walkExpression: () => walkExpression
});
module.exports = __toCommonJS(internal_exports);
var import_internal = require("../../core/_internal");
var booleanOperators = __toESM(require("../../operators/expression/boolean"));
var comparisonOperators = __toESM(require("../../operators/expression/comparison"));
var queryOperators = __toESM(require("../../operators/query"));
var import_query = require("../../query");
var import_internal2 = require("../../util/_internal");
const DEFAULT_OPTIONS = import_internal.ComputeOptions.init({
  context: import_internal.Context.init().addQueryOps(queryOperators).addExpressionOps(booleanOperators).addExpressionOps(comparisonOperators)
}).update({ updateConfig: { cloneMode: "copy" } });
const clone = (val, opts) => {
  const mode = opts?.local?.updateConfig?.cloneMode;
  switch (mode) {
    case "deep":
      return (0, import_internal2.cloneDeep)(val);
    case "copy": {
      if ((0, import_internal2.isDate)(val)) return new Date(val);
      if ((0, import_internal2.isArray)(val)) return val.slice();
      if ((0, import_internal2.isObject)(val)) return Object.assign({}, val);
      if ((0, import_internal2.isRegExp)(val)) return new RegExp(val);
      return val;
    }
  }
  return val;
};
const FIRST_ONLY = "$";
const ARRAY_WIDE = "$[]";
const applyUpdate = (o, n, q, f, opts) => {
  const { selector, position: c, next } = n;
  if (!c) {
    let b = false;
    const g = (u, k) => b = Boolean(f(u, k)) || b;
    (0, import_internal2.walk)(o, selector, g, opts);
    return b;
  }
  const arr = (0, import_internal2.resolve)(o, selector);
  if (!(0, import_internal2.isArray)(arr) || !arr.length) return false;
  if (c === FIRST_ONLY) {
    const i = arr.findIndex((e) => q[selector].test({ [selector]: [e] }));
    (0, import_internal2.assert)(i > -1, "BUG: positional operator found no match for " + selector);
    return next ? applyUpdate(arr[i], next, q, f, opts) : f(arr, i);
  }
  return arr.map((e, i) => {
    if (c !== ARRAY_WIDE && q[c] && !q[c].test({ [c]: [e] })) return false;
    return next ? applyUpdate(e, next, q, f, opts) : f(arr, i);
  }).some(Boolean);
};
const ERR_MISSING_FIELD = "You must include the array field for '.$' as part of the query document.";
const ERR_IMMUTABLE_FIELD = (path, idKey) => `Performing an update on the path '${path}' would modify the immutable field '${idKey}'.`;
function walkExpression(expr, arrayFilters, options, callback) {
  const opts = options;
  const params = opts.local.updateParams ?? buildParams([expr], arrayFilters, opts);
  const modified = [];
  for (const [key, val] of Object.entries(expr)) {
    const { node, queries } = params[key];
    if (callback(val, node, queries)) modified.push(node.selector);
  }
  return modified.sort();
}
function buildParams(exprList, arrayFilters, options) {
  const params = {};
  arrayFilters ||= [];
  const filterIndexMap = arrayFilters.reduce(
    (res, filter) => {
      for (const k of Object.keys(filter)) {
        const parent = k.split(".")[0];
        if (res[parent]) {
          res[parent][k] = filter[k];
        } else {
          res[parent] = { [k]: filter[k] };
        }
      }
      return res;
    },
    {}
  );
  let { condition } = options.local;
  condition = condition ?? {};
  const queryKeys = Object.keys(condition);
  const conflictDetector = new import_internal2.PathValidator();
  for (const expr of exprList) {
    for (const selector of Object.keys(expr)) {
      const identifiers = [];
      const node = selector.includes("$") ? { selector: "" } : { selector };
      if (!node.selector) {
        selector.split(".").reduce((n, v) => {
          if (v === FIRST_ONLY || v === ARRAY_WIDE) {
            n.position = v;
          } else if (v.startsWith("$[") && v.endsWith("]")) {
            const id = v.slice(2, -1);
            (0, import_internal2.assert)(
              /^[a-z]+\w*$/.test(id),
              `The filter <identifier> must begin with a lowercase letter and contain only alphanumeric characters. '${v}' is invalid.`
            );
            identifiers.push(id);
            n.position = id;
          } else if (!n.selector) {
            n.selector = v;
          } else if (!n.position) {
            n.selector += "." + v;
          } else {
            n.next = { selector: v };
            return n.next;
          }
          return n;
        }, node);
      }
      const queries = {};
      if (identifiers.length) {
        const filters = {};
        identifiers.forEach((v) => filters[v] = filterIndexMap[v]);
        for (const [k, c] of Object.entries(filters)) {
          queries[k] = new import_query.Query(c, options);
        }
      }
      if (node.position === FIRST_ONLY) {
        const field = node.selector;
        (0, import_internal2.assert)(queryKeys && queryKeys.length, ERR_MISSING_FIELD);
        const matches = queryKeys.filter(
          (k2) => k2 === field || k2.startsWith(field + ".")
        );
        (0, import_internal2.assert)(matches.length === 1, ERR_MISSING_FIELD);
        const k = matches[0];
        queries[field] = new import_query.Query({ [k]: condition[k] }, options);
      }
      const idKey = options.idKey;
      (0, import_internal2.assert)(
        node.selector !== idKey && !node.selector.startsWith(`${idKey}.`),
        ERR_IMMUTABLE_FIELD(node.selector, idKey)
      );
      (0, import_internal2.assert)(
        conflictDetector.add(node.selector),
        `updating the path '${node.selector}' would create a conflict at '${node.selector}'`
      );
      params[selector] = { node, queries };
    }
  }
  return params;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_OPTIONS,
  applyUpdate,
  buildParams,
  clone,
  walkExpression
});
