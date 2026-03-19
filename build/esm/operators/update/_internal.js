import { ComputeOptions, Context } from "../../core/_internal";
import * as booleanOperators from "../../operators/expression/boolean";
import * as comparisonOperators from "../../operators/expression/comparison";
import * as queryOperators from "../../operators/query";
import { Query } from "../../query";
import {
  assert,
  cloneDeep,
  isArray,
  isDate,
  isObject,
  isRegExp,
  PathValidator,
  resolve,
  walk
} from "../../util/_internal";
const DEFAULT_OPTIONS = ComputeOptions.init({
  context: Context.init().addQueryOps(queryOperators).addExpressionOps(booleanOperators).addExpressionOps(comparisonOperators)
}).update({ updateConfig: { cloneMode: "copy" } });
const clone = (val, opts) => {
  const mode = opts?.local?.updateConfig?.cloneMode;
  switch (mode) {
    case "deep":
      return cloneDeep(val);
    case "copy": {
      if (isDate(val)) return new Date(val);
      if (isArray(val)) return val.slice();
      if (isObject(val)) return Object.assign({}, val);
      if (isRegExp(val)) return new RegExp(val);
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
    walk(o, selector, g, opts);
    return b;
  }
  const arr = resolve(o, selector);
  if (!isArray(arr) || !arr.length) return false;
  if (c === FIRST_ONLY) {
    const i = arr.findIndex((e) => q[selector].test({ [selector]: [e] }));
    assert(i > -1, "BUG: positional operator found no match for " + selector);
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
  const conflictDetector = new PathValidator();
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
            assert(
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
          queries[k] = new Query(c, options);
        }
      }
      if (node.position === FIRST_ONLY) {
        const field = node.selector;
        assert(queryKeys && queryKeys.length, ERR_MISSING_FIELD);
        const matches = queryKeys.filter(
          (k2) => k2 === field || k2.startsWith(field + ".")
        );
        assert(matches.length === 1, ERR_MISSING_FIELD);
        const k = matches[0];
        queries[field] = new Query({ [k]: condition[k] }, options);
      }
      const idKey = options.idKey;
      assert(
        node.selector !== idKey && !node.selector.startsWith(`${idKey}.`),
        ERR_IMMUTABLE_FIELD(node.selector, idKey)
      );
      assert(
        conflictDetector.add(node.selector),
        `updating the path '${node.selector}' would create a conflict at '${node.selector}'`
      );
      params[selector] = { node, queries };
    }
  }
  return params;
}
export {
  DEFAULT_OPTIONS,
  applyUpdate,
  buildParams,
  clone,
  walkExpression
};
