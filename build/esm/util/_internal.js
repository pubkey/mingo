import { hashCode } from "./_hash";
import { hashCode as hashCode2 } from "./_hash";
class MingoError extends Error {
}
const MISSING = /* @__PURE__ */ Symbol("missing");
const ERR_CYCLE_FOUND = "mingo: cycle detected while processing object/array";
const isPrimitive = (v) => typeof v !== "object" && typeof v !== "function" || v === null;
const isScalar = (v) => isPrimitive(v) || isDate(v) || isRegExp(v);
const isDigitStr = (s) => {
  if (s.length === 0) return false;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 48 || c > 57) return false;
  }
  return true;
};
const SORT_ORDER = {
  undefined: 1,
  null: 2,
  number: 3,
  string: 4,
  symbol: 5,
  object: 6,
  array: 7,
  arraybuffer: 8,
  boolean: 9,
  date: 10,
  regexp: 11,
  function: 12
};
const USER_TYPE = Object.keys(SORT_ORDER).length * 2;
const simpleCmp = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const typedArraysCmp = (a, b) => {
  const bytesA = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  const bytesB = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
  const size = Math.min(bytesA.length, bytesB.length);
  for (let i = 0; i < size; i++) {
    const order = simpleCmp(bytesA[i], bytesB[i]);
    if (order !== 0) return order;
  }
  return simpleCmp(bytesA.length, bytesB.length);
};
function mingoCmp(a, b, descendArray = false) {
  let neq = 0;
  if (a === MISSING) a = void 0;
  if (b === MISSING) b = void 0;
  if (a === b || Object.is(a, b)) return 0;
  if (typeof a === "number" && typeof b === "number") return a < b ? -1 : 1;
  if (typeof a === "string" && typeof b === "string")
    return a < b ? -1 : a > b ? 1 : 0;
  const typeA = isTypedArray(a) ? "arraybuffer" : typeOf(a);
  const typeB = isTypedArray(b) ? "arraybuffer" : typeOf(b);
  if (typeA !== typeB) {
    if (typeA == "undefined") return -1;
    if (typeB == "undefined") return 1;
    if (descendArray && typeA == "array" && !a.length) return -1;
    if (descendArray && typeB == "array" && !b.length) return 1;
    if (descendArray) {
      if (isArray(a)) {
        const sorted = a.slice().sort(mingoCmp);
        neq = 1;
        for (const v of sorted)
          if ((neq = Math.min(neq, mingoCmp(v, b))) < 0) return neq;
        return neq;
      } else if (isArray(b)) {
        const sorted = b.slice().sort(mingoCmp);
        neq = -1;
        for (const v of sorted)
          if ((neq = Math.max(neq, mingoCmp(a, v))) > 0) return neq;
        return neq;
      }
    }
    const orderA = SORT_ORDER[typeA] ?? USER_TYPE;
    const orderB = SORT_ORDER[typeB] ?? USER_TYPE;
    if (orderA !== orderB) return simpleCmp(orderA, orderB);
  }
  switch (typeA) {
    case "number":
    case "string":
      return simpleCmp(a, b);
    case "boolean":
    case "date":
      return simpleCmp(+a, +b);
    case "regexp":
      if (neq = simpleCmp(a.source, b.source))
        return neq;
      if (neq = simpleCmp(a.flags, b.flags))
        return neq;
      return 0;
    case "arraybuffer":
      return typedArraysCmp(a, b);
    case "array": {
      const x = a.slice().sort(mingoCmp);
      const y = b.slice().sort(mingoCmp);
      const size = Math.min(x.length, y.length);
      for (let i = 0; i < size; i++)
        if (neq = mingoCmp(x[i], y[i])) return neq;
      return simpleCmp(x.length, y.length);
    }
    default: {
      if (typeA !== "object") {
        const isSameType = a?.constructor === b?.constructor;
        if (isSameType && hasCustomString(a))
          return simpleCmp(a.toString(), b.toString());
        if (neq = simpleCmp(a?.constructor?.name, b?.constructor?.name))
          return neq;
      }
      const keysA = Object.keys(a).sort();
      const keysB = Object.keys(b).sort();
      if (neq = mingoCmp(keysA, keysB)) return neq;
      for (const k of keysA)
        if (neq = mingoCmp(a[k], b[k]))
          return neq;
      return 0;
    }
  }
}
const compare = (a, b) => mingoCmp(a, b, true);
const hasCustomString = (o) => o !== null && o !== void 0 && o["toString"] !== Object.prototype.toString;
function isEqual(a, b) {
  if (a === b || Object.is(a, b)) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (a.constructor !== b?.constructor) return false;
  if (isDate(a)) return isDate(b) && +a === +b;
  if (isRegExp(a))
    return isRegExp(b) && a.source === b.source && a.flags === b.flags;
  if (isArray(a) && isArray(b)) {
    return a.length === b.length && a.every((v, i) => isEqual(v, b[i]));
  }
  if (a?.constructor !== Object && hasCustomString(a)) {
    return a?.toString() === b?.toString();
  }
  const objA = a;
  const objB = b;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => has(objB, k) && isEqual(objA[k], objB[k]));
}
class HashMap extends Map {
  // maps the hashcode to key set
  #keyMap = /* @__PURE__ */ new Map();
  // returns a tuple of [<masterKey>, <hash>]. Expects an object key.
  #unpack = (key) => {
    const hash = hashCode(key);
    const items = this.#keyMap.get(hash) ?? [];
    return [items.find((k) => isEqual(k, key)), hash];
  };
  constructor() {
    super();
  }
  /**
   * Returns a new {@link HashMap} object.
   * @param fn An optional custom hash function
   */
  static init() {
    return new HashMap();
  }
  clear() {
    super.clear();
    this.#keyMap.clear();
  }
  /**
   * @returns true if an element in the Map existed and has been removed, or false if the element does not exist.
   */
  delete(key) {
    if (isPrimitive(key)) return super.delete(key);
    const [masterKey, hash] = this.#unpack(key);
    if (!super.delete(masterKey)) return false;
    this.#keyMap.set(
      hash,
      this.#keyMap.get(hash).filter((k) => !isEqual(k, masterKey))
    );
    return true;
  }
  /**
   * Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
   * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
  get(key) {
    if (isPrimitive(key)) return super.get(key);
    const [masterKey, _] = this.#unpack(key);
    return super.get(masterKey);
  }
  /**
   * @returns boolean indicating whether an element with the specified key exists or not.
   */
  has(key) {
    if (isPrimitive(key)) return super.has(key);
    const [masterKey, _] = this.#unpack(key);
    return super.has(masterKey);
  }
  /**
   * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
   */
  set(key, value) {
    if (isPrimitive(key)) return super.set(key, value);
    const [masterKey, hash] = this.#unpack(key);
    if (super.has(masterKey)) {
      super.set(masterKey, value);
    } else {
      super.set(key, value);
      const keys = this.#keyMap.get(hash) || [];
      keys.push(key);
      this.#keyMap.set(hash, keys);
    }
    return this;
  }
  /**
   * @returns the number of elements in the Map.
   */
  get size() {
    return super.size;
  }
}
function assert(condition, msg) {
  if (!condition) throw new MingoError(msg);
}
function typeOf(v) {
  if (v === null) return "null";
  const t = typeof v;
  if (t !== "object" && SORT_ORDER[t]) return t;
  if (isArray(v)) return "array";
  if (isDate(v)) return "date";
  if (isRegExp(v)) return "regexp";
  return v?.constructor?.name?.toLowerCase() ?? "object";
}
const isBoolean = (v) => typeof v === "boolean";
const isString = (v) => typeof v === "string";
const isSymbol = (v) => typeof v === "symbol";
const isNumber = (v) => !Number.isNaN(v) && typeof v === "number";
const isInteger = Number.isInteger;
const isArray = Array.isArray;
const isObject = (v) => {
  if (v === null || typeof v !== "object") return false;
  if (isArray(v) || isDate(v) || isRegExp(v)) return false;
  const ctor = v.constructor;
  return ctor === Object || ctor === void 0;
};
const isObjectLike = (v) => !isPrimitive(v);
const isDate = (v) => v instanceof Date;
const isRegExp = (v) => v instanceof RegExp;
const isFunction = (v) => typeof v === "function";
const isNil = (v) => v === null || v === void 0;
const truthy = (arg, strict = true) => !!arg || strict && arg === "";
const isEmpty = (x) => isNil(x) || isString(x) && !x || isArray(x) && x.length === 0 || isObject(x) && Object.keys(x).length === 0;
const ensureArray = (x) => isArray(x) ? x : [x];
const has = (obj, ...props) => !!obj && props.every((p) => Object.prototype.hasOwnProperty.call(obj, p));
const isTypedArray = (v) => typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(v);
const cloneDeep = (v, refs) => {
  if (isNil(v) || isBoolean(v) || isNumber(v) || isString(v)) return v;
  if (isDate(v)) return new Date(v);
  if (isRegExp(v)) return new RegExp(v);
  if (isTypedArray(v)) {
    const ctor = v.constructor;
    return new ctor(v);
  }
  if (!(refs instanceof WeakSet)) refs = /* @__PURE__ */ new WeakSet();
  if (refs.has(v)) throw new Error(ERR_CYCLE_FOUND);
  refs.add(v);
  try {
    if (isArray(v)) {
      const arr = new Array(v.length);
      for (let i = 0; i < v.length; i++) arr[i] = cloneDeep(v[i], refs);
      return arr;
    }
    if (isObject(v)) {
      const obj = {};
      for (const k of Object.keys(v)) obj[k] = cloneDeep(v[k], refs);
      return obj;
    }
  } finally {
    refs.delete(v);
  }
  return v;
};
function intersection(input) {
  if (input.length === 0) return [];
  if (input.some((arr) => arr.length === 0)) return [];
  if (input.length === 1) return input[0].slice();
  const vmaps = [HashMap.init(), HashMap.init()];
  input[input.length - 1].forEach((v) => vmaps[0].set(v, true));
  for (let i = input.length - 2; i > -1; i--) {
    for (let j = 0; j < input[i].length; j++) {
      const v = input[i][j];
      if (vmaps[0].has(v)) vmaps[1].set(v, true);
    }
    if (vmaps[1].size === 0) return [];
    vmaps.reverse();
    vmaps[1].clear();
  }
  return Array.from(vmaps[0].keys());
}
function flatten(xs, depth = 1) {
  const arr = new Array();
  function flatten2(ys, n) {
    for (let i = 0, len = ys.length; i < len; i++) {
      if (isArray(ys[i]) && (n > 0 || n < 0)) {
        flatten2(ys[i], Math.max(-1, n - 1));
      } else {
        arr.push(ys[i]);
      }
    }
  }
  flatten2(xs, depth);
  return arr;
}
function unique(input) {
  const m = HashMap.init();
  input.forEach((v) => m.set(v, true));
  return Array.from(m.keys());
}
function groupBy(collection, keyFunc) {
  if (collection.length < 1) return /* @__PURE__ */ new Map();
  const result = HashMap.init();
  for (let i = 0; i < collection.length; i++) {
    const obj = collection[i];
    const key = keyFunc(obj, i) ?? null;
    let a = result.get(key);
    if (!a) {
      a = [obj];
      result.set(key, a);
    } else {
      a.push(obj);
    }
  }
  return result;
}
function getValue(obj, key) {
  return isObjectLike(obj) ? obj[key] : void 0;
}
function unwrap(arr, depth) {
  if (depth < 1) return arr;
  while (depth-- && arr.length === 1 && isArray(arr[0])) arr = arr[0];
  return arr;
}
function resolve(obj, selector, options, pathArray) {
  if (isScalar(obj)) return obj;
  const path = pathArray || selector.split(".");
  if (path.length === 1 && !isArray(obj)) {
    return getValue(obj, path[0]);
  }
  let depth = 0;
  function resolve2(o, path2) {
    let value = o;
    for (let i = 0; i < path2.length; i++) {
      const field = path2[i];
      const isText = !isDigitStr(field);
      if (isText && isArray(value)) {
        if (i === 0 && depth > 0) break;
        depth += 1;
        const subpath = path2.slice(i);
        value = value.reduce((acc, item) => {
          const v = resolve2(item, subpath);
          if (v !== void 0) acc.push(v);
          return acc;
        }, []);
        break;
      } else {
        value = getValue(value, field);
      }
      if (value === void 0) break;
    }
    return value;
  }
  const res = resolve2(obj, path);
  return isArray(res) && options?.unwrapArray ? unwrap(res, depth) : res;
}
function resolveGraph(obj, selector, options) {
  const sep = selector.indexOf(".");
  const key = sep == -1 ? selector : selector.substring(0, sep);
  const next = selector.substring(sep + 1);
  const hasNext = sep != -1;
  if (isArray(obj)) {
    const isIndex = isDigitStr(key);
    const arr = isIndex && options?.preserveIndex ? obj.slice() : [];
    if (isIndex) {
      const index = parseInt(key);
      let value2 = getValue(obj, index);
      if (hasNext) {
        value2 = resolveGraph(value2, next, options);
      }
      if (options?.preserveIndex) {
        arr[index] = value2;
      } else {
        arr.push(value2);
      }
    } else {
      for (const item of obj) {
        const value2 = resolveGraph(item, selector, options);
        if (options?.preserveMissing) {
          arr.push(value2 == void 0 ? MISSING : value2);
        } else if (value2 != void 0 || options?.preserveIndex) {
          arr.push(value2);
        }
      }
    }
    return arr;
  }
  const res = options?.preserveKeys ? { ...obj } : {};
  let value = getValue(obj, key);
  if (hasNext) {
    value = resolveGraph(value, next, options);
  }
  if (value === void 0) return void 0;
  res[key] = value;
  return res;
}
function filterMissing(obj) {
  if (isArray(obj)) {
    for (let i = obj.length - 1; i >= 0; i--) {
      if (obj[i] === MISSING) {
        obj.splice(i, 1);
      } else {
        filterMissing(obj[i]);
      }
    }
  } else if (isObject(obj)) {
    for (const k of Object.keys(obj)) {
      if (has(obj, k)) {
        filterMissing(obj[k]);
      }
    }
  }
}
function walk(obj, selector, fn, options) {
  const names = selector.split(".");
  const key = names[0];
  const next = names.slice(1).join(".");
  if (names.length === 1) {
    if (isObject(obj) || isArray(obj) && isDigitStr(key)) {
      fn(obj, key);
    }
  } else {
    if (options?.buildGraph && isNil(obj[key])) {
      obj[key] = {};
    }
    const item = obj[key];
    if (!item) return;
    const isNextArrayIndex = !!(names.length > 1 && isDigitStr(names[1]));
    if (isArray(item) && options?.descendArray && !isNextArrayIndex) {
      item.forEach(((e) => walk(e, next, fn, options)));
    } else {
      walk(item, next, fn, options);
    }
  }
}
function setValue(obj, selector, value) {
  walk(obj, selector, (item, key) => item[key] = value, {
    buildGraph: true
  });
}
function removeValue(obj, selector, options) {
  walk(
    obj,
    selector,
    ((item, key) => {
      if (isArray(item)) {
        item.splice(parseInt(key), 1);
      } else if (isObject(item)) {
        delete item[key];
      }
    }),
    options
  );
}
const isOperator = (name) => !!name && name[0] === "$" && /^\$[a-zA-Z0-9_]+$/.test(name);
function normalize(expr) {
  if (isScalar(expr)) {
    return isRegExp(expr) ? { $regex: expr } : { $eq: expr };
  }
  if (isObjectLike(expr)) {
    let hasOp = false;
    for (const k in expr) {
      if (Object.prototype.hasOwnProperty.call(expr, k) && isOperator(k)) {
        hasOp = true;
        break;
      }
    }
    if (!hasOp) return { $eq: expr };
    if (isObject(expr) && has(expr, "$regex")) {
      const newExpr = { ...expr };
      newExpr["$regex"] = new RegExp(
        expr["$regex"],
        expr["$options"]
      );
      delete newExpr["$options"];
      return newExpr;
    }
  }
  return expr;
}
function findInsertIndex(sorted, item, comparator = compare) {
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = Math.round(lo + (hi - lo) / 2);
    if (comparator(item, sorted[mid]) < 0) {
      hi = mid - 1;
    } else if (comparator(item, sorted[mid]) > 0) {
      lo = mid + 1;
    } else {
      return mid;
    }
  }
  return lo;
}
class PathValidator {
  constructor() {
    this.root = {
      children: /* @__PURE__ */ new Map(),
      isTerminal: false
    };
  }
  add(selector) {
    const parts = selector.split(".");
    let current = this.root;
    for (const part of parts) {
      if (current.isTerminal) return false;
      if (!current.children.has(part)) {
        current.children.set(part, {
          children: /* @__PURE__ */ new Map(),
          isTerminal: false
        });
      }
      current = current.children.get(part);
    }
    if (current.isTerminal || current.children.size) return false;
    return current.isTerminal = true;
  }
}
export {
  HashMap,
  MISSING,
  MingoError,
  PathValidator,
  assert,
  cloneDeep,
  compare,
  ensureArray,
  filterMissing,
  findInsertIndex,
  flatten,
  groupBy,
  has,
  hashCode2 as hashCode,
  intersection,
  isArray,
  isBoolean,
  isDate,
  isEmpty,
  isEqual,
  isFunction,
  isInteger,
  isNil,
  isNumber,
  isObject,
  isObjectLike,
  isOperator,
  isPrimitive,
  isRegExp,
  isString,
  isSymbol,
  normalize,
  removeValue,
  resolve,
  resolveGraph,
  setValue,
  simpleCmp,
  truthy,
  typeOf,
  unique,
  walk
};
