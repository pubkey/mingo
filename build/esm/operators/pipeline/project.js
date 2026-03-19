import { ComputeOptions, evalExpr, OpType } from "../../core/_internal";
import {
  assert,
  ensureArray,
  filterMissing,
  has,
  intersection,
  isArray,
  isEmpty,
  isNil,
  isNumber,
  isObject,
  isOperator,
  MISSING,
  normalize,
  removeValue,
  resolve,
  resolveGraph,
  setValue,
  unique
} from "../../util/_internal";
import { validateProjection } from "./_internal";
const OP = "$project";
function $project(coll, expr, options) {
  if (isEmpty(expr)) return coll;
  const meta = validateProjection(expr, options);
  const handler = createHandler(expr, ComputeOptions.init(options), meta);
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
      removeValue(t, k, { descendArray: true });
    };
  }
  for (const selector of inclusions) {
    const v = resolve(expr, selector) ?? expr[selector];
    if (selector.endsWith(".$") && v === 1) {
      const cond = options?.local?.condition ?? {};
      assert(cond, `${OP}: positional operator '.$' requires array condition.`);
      const field = selector.slice(0, -2);
      handlers[field] = getPositionalFilter(field, cond, options);
      continue;
    }
    if (isArray(v)) {
      handlers[selector] = (t, o) => {
        options.update({ root: o });
        const newVal = v.map((e) => evalExpr(o, e, options) ?? null);
        setValue(t, selector, newVal);
      };
    } else if (isNumber(v) || v === true) {
      handlers[selector] = (t, o) => {
        options.update({ root: o });
        const extractedVal = resolveGraph(o, selector, resolveOpts);
        mergeInto(t, extractedVal);
      };
    } else if (!isObject(v)) {
      handlers[selector] = (t, o) => {
        options.update({ root: o });
        const newVal = evalExpr(o, v, options);
        setValue(t, selector, newVal);
      };
    } else {
      const opKeys = Object.keys(v);
      assert(
        opKeys.length === 1 && isOperator(opKeys[0]),
        "Not a valid operator"
      );
      const operator = opKeys[0];
      const opExpr = v[operator];
      const fn = options.context.getOperator(OpType.PROJECTION, operator);
      const foundSlice = operator === "$slice";
      if (!fn || foundSlice && !ensureArray(opExpr).every(isNumber)) {
        handlers[selector] = (t, o) => {
          options.update({ root: o });
          const newval = evalExpr(o, v, options);
          setValue(t, selector, newval);
        };
      } else {
        handlers[selector] = (t, o) => {
          options.update({ root: o });
          const newval = fn(o, opExpr, selector, options);
          setValue(t, selector, newval);
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
    if (!noInclusions) filterMissing(newObj);
    if (noIdKeyExcluded && !has(newObj, idKey) && has(o, idKey)) {
      newObj[idKey] = resolve(o, idKey);
    }
    return newObj;
  };
}
const findMatches = (o, key, leaf, pred) => {
  let arr = resolve(o, key);
  if (!isArray(arr)) arr = resolve(arr, leaf);
  assert(isArray(arr), `${OP}: field '${key}' must resolve to array`);
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
        normalize(val)
      ).pop();
      const fn = options.context.getOperator(
        OpType.QUERY,
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
    } else if (isOperator(key)) {
      assert(
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
      matches.push(unique(orMatches));
    }
    const i = intersection(matches).sort()[0];
    let first = resolve(o, field)[i];
    if (parent != leaf && !isObject(first)) {
      first = { [leaf]: first };
    }
    setValue(t, parent, [first]);
  };
}
function mergeInto(target, input) {
  if (target === MISSING || isNil(target)) return input;
  if (isNil(input)) return target;
  const out = target;
  const src = input;
  for (const k of Object.keys(input)) {
    out[k] = mergeInto(out[k], src[k]);
  }
  return out;
}
export {
  $project
};
