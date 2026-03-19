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
var project_exports = {};
__export(project_exports, {
  $project: () => $project
});
module.exports = __toCommonJS(project_exports);
var import_internal = require("../../core/_internal");
var import_internal2 = require("../../util/_internal");
var import_internal3 = require("./_internal");
const OP = "$project";
function $project(coll, expr, options) {
  if ((0, import_internal2.isEmpty)(expr)) return coll;
  const meta = (0, import_internal3.validateProjection)(expr, options);
  const handler = createHandler(expr, import_internal.ComputeOptions.init(options), meta);
  return coll.map(handler);
}
function createHandler(expr, options, meta) {
  const idKey = options.idKey;
  const { exclusions, inclusions } = meta;
  const handlers = {};
  const resolveOpts = {
    preserveMissing: true
  };
  for (const k of exclusions) {
    handlers[k] = (t, _) => {
      (0, import_internal2.removeValue)(t, k, { descendArray: true });
    };
  }
  for (const selector of inclusions) {
    const v = (0, import_internal2.resolve)(expr, selector) ?? expr[selector];
    if (selector.endsWith(".$") && v === 1) {
      const cond = options?.local?.condition ?? {};
      (0, import_internal2.assert)(cond, `${OP}: positional operator '.$' requires array condition.`);
      const field = selector.slice(0, -2);
      handlers[field] = getPositionalFilter(field, cond, options);
      continue;
    }
    if ((0, import_internal2.isArray)(v)) {
      handlers[selector] = (t, o) => {
        options.update({ root: o });
        const newVal = v.map((e) => (0, import_internal.evalExpr)(o, e, options) ?? null);
        (0, import_internal2.setValue)(t, selector, newVal);
      };
    } else if ((0, import_internal2.isNumber)(v) || v === true) {
      handlers[selector] = (t, o) => {
        options.update({ root: o });
        const extractedVal = (0, import_internal2.resolveGraph)(o, selector, resolveOpts);
        mergeInto(t, extractedVal);
      };
    } else if (!(0, import_internal2.isObject)(v)) {
      handlers[selector] = (t, o) => {
        options.update({ root: o });
        const newVal = (0, import_internal.evalExpr)(o, v, options);
        (0, import_internal2.setValue)(t, selector, newVal);
      };
    } else {
      const opKeys = Object.keys(v);
      (0, import_internal2.assert)(
        opKeys.length === 1 && (0, import_internal2.isOperator)(opKeys[0]),
        "Not a valid operator"
      );
      const operator = opKeys[0];
      const opExpr = v[operator];
      const fn = options.context.getOperator(import_internal.OpType.PROJECTION, operator);
      const foundSlice = operator === "$slice";
      if (!fn || foundSlice && !(0, import_internal2.ensureArray)(opExpr).every(import_internal2.isNumber)) {
        handlers[selector] = (t, o) => {
          options.update({ root: o });
          const newval = (0, import_internal.evalExpr)(o, v, options);
          (0, import_internal2.setValue)(t, selector, newval);
        };
      } else {
        handlers[selector] = (t, o) => {
          options.update({ root: o });
          const newval = fn(o, opExpr, selector, options);
          (0, import_internal2.setValue)(t, selector, newval);
        };
      }
    }
  }
  const onlyIdKeyExcluded = exclusions.length === 1 && exclusions.includes(idKey);
  const noIdKeyExcluded = !exclusions.includes(idKey);
  const noInclusions = !inclusions.length;
  const allKeysIncluded = noInclusions && onlyIdKeyExcluded || noInclusions && exclusions.length && !onlyIdKeyExcluded;
  return (o) => {
    const newObj = {};
    if (allKeysIncluded) Object.assign(newObj, o);
    for (const k in handlers) {
      handlers[k](newObj, o);
    }
    if (!noInclusions) (0, import_internal2.filterMissing)(newObj);
    if (noIdKeyExcluded && !(0, import_internal2.has)(newObj, idKey) && (0, import_internal2.has)(o, idKey)) {
      newObj[idKey] = (0, import_internal2.resolve)(o, idKey);
    }
    return newObj;
  };
}
const findMatches = (o, key, leaf, pred) => {
  let arr = (0, import_internal2.resolve)(o, key);
  if (!(0, import_internal2.isArray)(arr)) arr = (0, import_internal2.resolve)(arr, leaf);
  (0, import_internal2.assert)((0, import_internal2.isArray)(arr), `${OP}: field '${key}' must resolve to array`);
  const matches = [];
  arr.forEach((e, i) => pred({ [leaf]: [e] }) && matches.push(i));
  return matches;
};
const complement = (p) => ((e) => !p(e));
const COMPOUND_OPS = { $and: 1, $or: 1, $nor: 1 };
function getPositionalFilter(field, condition, options) {
  const stack = Object.entries(condition).slice();
  const selectors = {
    $and: [],
    $or: []
  };
  for (let i = 0; i < stack.length; i++) {
    const [key, val, op] = stack[i];
    if (key === field || key.startsWith(field + ".")) {
      const [operator, expr] = Object.entries(
        (0, import_internal2.normalize)(val)
      ).pop();
      const fn = options.context.getOperator(
        import_internal.OpType.QUERY,
        operator
      );
      const leaf2 = key.substring(key.lastIndexOf(".") + 1);
      const pred = fn(leaf2, expr, options);
      if (!op || op === "$and") {
        selectors.$and.push([key, pred, leaf2]);
      } else if (op === "$nor") {
        selectors.$and.push([key, complement(pred), leaf2]);
      } else if (op === "$or") {
        selectors.$or.push([key, pred, leaf2]);
      }
    } else if ((0, import_internal2.isOperator)(key)) {
      (0, import_internal2.assert)(
        !!COMPOUND_OPS[key],
        `${OP}: '${key}' is not allowed in this context`
      );
      for (const item of val) {
        Object.entries(item).forEach(([k, v]) => stack.push([k, v, key]));
      }
    }
  }
  const sep = field.lastIndexOf(".");
  const parent = field.substring(0, sep) || field;
  const leaf = field.substring(sep + 1);
  return (t, o) => {
    const matches = [];
    for (const [key, pred, leaf2] of selectors.$and) {
      matches.push(findMatches(o, key, leaf2, pred));
    }
    if (selectors.$or.length) {
      const orMatches = [];
      for (const [key, pred, leaf2] of selectors.$or) {
        orMatches.push(...findMatches(o, key, leaf2, pred));
      }
      matches.push((0, import_internal2.unique)(orMatches));
    }
    const i = (0, import_internal2.intersection)(matches).sort()[0];
    let first = (0, import_internal2.resolve)(o, field)[i];
    if (parent != leaf && !(0, import_internal2.isObject)(first)) {
      first = { [leaf]: first };
    }
    (0, import_internal2.setValue)(t, parent, [first]);
  };
}
function mergeInto(target, input) {
  if (target === import_internal2.MISSING || (0, import_internal2.isNil)(target)) return input;
  if ((0, import_internal2.isNil)(input)) return target;
  const out = target;
  const src = input;
  for (const k of Object.keys(input)) {
    out[k] = mergeInto(out[k], src[k]);
  }
  return out;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $project
});
