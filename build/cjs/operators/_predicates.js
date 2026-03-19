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
var predicates_exports = {};
__export(predicates_exports, {
  $all: () => $all,
  $elemMatch: () => $elemMatch,
  $eq: () => $eq,
  $gt: () => $gt,
  $gte: () => $gte,
  $in: () => $in,
  $lt: () => $lt,
  $lte: () => $lte,
  $mod: () => $mod,
  $ne: () => $ne,
  $nin: () => $nin,
  $regex: () => $regex,
  $size: () => $size,
  $type: () => $type,
  processExpression: () => processExpression,
  processQuery: () => processQuery
});
module.exports = __toCommonJS(predicates_exports);
var import_internal = require("../core/_internal");
var import_query = require("../query");
var import_internal2 = require("../util/_internal");
function processQuery(selector, value, options, predicate) {
  const opts = { unwrapArray: true };
  const depth = Math.max(1, selector.split(".").length - 1);
  const copts = import_internal.ComputeOptions.init(options).update({ depth });
  return (o) => {
    const lhs = (0, import_internal2.resolve)(o, selector, opts);
    return predicate(lhs, value, copts);
  };
}
function processExpression(obj, expr, options, predicate) {
  (0, import_internal2.assert)(
    (0, import_internal2.isArray)(expr) && expr.length === 2,
    `${predicate.name} expects array(2)`
  );
  const [lhs, rhs] = (0, import_internal.evalExpr)(obj, expr, options);
  return predicate(lhs, rhs, options);
}
function $eq(a, b, options) {
  if ((0, import_internal2.isEqual)(a, b)) return true;
  if ((0, import_internal2.isNil)(a) && (0, import_internal2.isNil)(b)) return true;
  if ((0, import_internal2.isArray)(a)) {
    const depth = options?.local?.depth ?? 1;
    return a.some((v) => (0, import_internal2.isEqual)(v, b)) || (0, import_internal2.flatten)(a, depth).some((v) => (0, import_internal2.isEqual)(v, b));
  }
  return false;
}
function $ne(a, b, options) {
  return !$eq(a, b, options);
}
function $in(a, b, _options) {
  if ((0, import_internal2.isNil)(a)) return b.some((v) => v === null);
  return (0, import_internal2.intersection)([(0, import_internal2.ensureArray)(a), b]).length > 0;
}
function $nin(a, b, options) {
  return !$in(a, b, options);
}
function $lt(a, b, _options) {
  return compare(a, b, (x, y) => (0, import_internal2.compare)(x, y) < 0);
}
function $lte(a, b, _options) {
  return compare(a, b, (x, y) => (0, import_internal2.compare)(x, y) <= 0);
}
function $gt(a, b, _options) {
  return compare(a, b, (x, y) => (0, import_internal2.compare)(x, y) > 0);
}
function $gte(a, b, _options) {
  return compare(a, b, (x, y) => (0, import_internal2.compare)(x, y) >= 0);
}
function $mod(a, b, _options) {
  return (0, import_internal2.ensureArray)(a).some(
    ((x) => b.length === 2 && x % b[0] === b[1])
  );
}
function $regex(a, b, options) {
  const lhs = (0, import_internal2.ensureArray)(a);
  const match = (x) => (0, import_internal2.isString)(x) && (0, import_internal2.truthy)(b.exec(x), options?.useStrictMode);
  return lhs.some(match) || (0, import_internal2.flatten)(lhs, 1).some(match);
}
function $all(values, queries, options) {
  if (!(0, import_internal2.isArray)(values) || !(0, import_internal2.isArray)(queries) || !values.length || !queries.length) {
    return false;
  }
  let matched = true;
  for (const query of queries) {
    if (!matched) break;
    if ((0, import_internal2.isObject)(query) && Object.keys(query).includes("$elemMatch")) {
      matched = $elemMatch(values, query["$elemMatch"], options);
    } else if ((0, import_internal2.isRegExp)(query)) {
      matched = values.some((s) => typeof s === "string" && query.test(s));
    } else {
      matched = values.some((v) => (0, import_internal2.isEqual)(query, v));
    }
  }
  return matched;
}
function $size(a, b, _options) {
  return Array.isArray(a) && a.length === b;
}
function isNonBooleanOperator(name) {
  return (0, import_internal2.isOperator)(name) && ["$and", "$or", "$nor"].indexOf(name) === -1;
}
function $elemMatch(a, b, options) {
  if ((0, import_internal2.isArray)(a) && !(0, import_internal2.isEmpty)(a)) {
    let format = (x) => x;
    let criteria = b;
    if (Object.keys(b).every(isNonBooleanOperator)) {
      criteria = { temp: b };
      format = (x) => ({ temp: x });
    }
    const query = new import_query.Query(criteria, options);
    for (let i = 0, len = a.length; i < len; i++) {
      if (query.test(format(a[i]))) {
        return true;
      }
    }
  }
  return false;
}
const isNull = (a) => a === null;
const compareFuncs = {
  array: import_internal2.isArray,
  boolean: import_internal2.isBoolean,
  bool: import_internal2.isBoolean,
  date: import_internal2.isDate,
  number: import_internal2.isNumber,
  int: import_internal2.isNumber,
  long: import_internal2.isNumber,
  double: import_internal2.isNumber,
  decimal: import_internal2.isNumber,
  null: isNull,
  object: import_internal2.isObject,
  regexp: import_internal2.isRegExp,
  regex: import_internal2.isRegExp,
  string: import_internal2.isString,
  // added for completeness
  undefined: import_internal2.isNil,
  // deprecated
  // Mongo identifiers
  1: import_internal2.isNumber,
  //double
  2: import_internal2.isString,
  3: import_internal2.isObject,
  4: import_internal2.isArray,
  6: import_internal2.isNil,
  // deprecated
  8: import_internal2.isBoolean,
  9: import_internal2.isDate,
  10: isNull,
  11: import_internal2.isRegExp,
  16: import_internal2.isNumber,
  //int
  18: import_internal2.isNumber,
  //long
  19: import_internal2.isNumber
  //decimal
};
function compareType(a, b, _) {
  const f = compareFuncs[b];
  return f ? f(a) : false;
}
function $type(a, b, options) {
  return (0, import_internal2.isArray)(b) ? b.findIndex((t) => compareType(a, t, options)) >= 0 : compareType(a, b, options);
}
function compare(a, b, f) {
  return (0, import_internal2.ensureArray)(a).some((x) => (0, import_internal2.typeOf)(x) === (0, import_internal2.typeOf)(b) && f(x, b));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $all,
  $elemMatch,
  $eq,
  $gt,
  $gte,
  $in,
  $lt,
  $lte,
  $mod,
  $ne,
  $nin,
  $regex,
  $size,
  $type,
  processExpression,
  processQuery
});
