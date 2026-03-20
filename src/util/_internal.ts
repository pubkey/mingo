/**
 * Utility constants and functions
 */
import { Any, AnyObject, ArrayOrObject, Callback, Comparator } from "../types";
import { hashCode } from "./_hash";

export { hashCode } from "./_hash";

/** Represents an error reported by the mingo library. */
export class MingoError extends Error {}

// special value to identify missing items. treated differently from undefined
export const MISSING = Symbol("missing");
const ERR_CYCLE_FOUND = "mingo: cycle detected while processing object/array";

type Constructor = new (...args: Any[]) => Any;

export const isPrimitive = (v: Any): boolean =>
  (typeof v !== "object" && typeof v !== "function") || v === null;

/** Scalar types provided by the JS runtime. Includes primitives, RegExp, and Date */
const isScalar = (v: Any) => isPrimitive(v) || isDate(v) || isRegExp(v);

/** Check if a string contains only digits (equivalent to /^\d+$/ but faster). */
const isDigitStr = (s: string): boolean => {
  if (s.length === 0) return false;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 48 || c > 57) return false;
  }
  return true;
};

/** MongoDB sort comparison order. https://www.mongodb.com/docs/manual/reference/bson-type-comparison-order */
const SORT_ORDER: Record<string, number> = {
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
type Cmp = string | number;
export const simpleCmp = <T = Cmp>(a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0);
const typedArraysCmp = (a: ArrayBufferView, b: ArrayBufferView): number => {
  const bytesA = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  const bytesB = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
  const size = Math.min(bytesA.length, bytesB.length);
  // Compare byte by byte
  for (let i = 0; i < size; i++) {
    const order = simpleCmp(bytesA[i], bytesB[i]);
    if (order !== 0) return order;
  }
  return simpleCmp(bytesA.length, bytesB.length);
};

function mingoCmp(a: Any, b: Any, descendArray: boolean = false): number {
  // capture "not equal" result to use in if-expressions when order evaluates to 1 or -1.
  let neq = 0;

  if (a === MISSING) a = undefined;
  if (b === MISSING) b = undefined;
  // null, undefined, same object ref, same primitive value
  if (a === b || Object.is(a, b)) return 0;
  // fast path: both numbers (very common in sorting/comparisons)
  if (typeof a === "number" && typeof b === "number") return a < b ? -1 : 1;
  // fast path: both strings
  if (typeof a === "string" && typeof b === "string")
    return a < b ? -1 : a > b ? 1 : 0;
  const typeA = isTypedArray(a) ? "arraybuffer" : typeOf(a);
  const typeB = isTypedArray(b) ? "arraybuffer" : typeOf(b);
  // unequal types
  if (typeA !== typeB) {
    // undefined is smallest, empty array is next smallest.
    if (typeA == "undefined") return -1;
    if (typeB == "undefined") return 1;
    if (descendArray && typeA == "array" && !(a as Any[]).length) return -1;
    if (descendArray && typeB == "array" && !(b as Any[]).length) return 1;
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
      return simpleCmp(+(a as Date | boolean), +(b as Date | boolean));
    case "regexp":
      if ((neq = simpleCmp((a as RegExp).source, (b as RegExp).source)))
        return neq;
      if ((neq = simpleCmp((a as RegExp).flags, (b as RegExp).flags)))
        return neq;
      return 0;
    case "arraybuffer":
      return typedArraysCmp(a as ArrayBufferView, b as ArrayBufferView);
    case "array": {
      const x = (a as Any[]).slice().sort(mingoCmp);
      const y = (b as Any[]).slice().sort(mingoCmp);
      const size = Math.min(x.length, y.length);
      for (let i = 0; i < size; i++)
        if ((neq = mingoCmp(x[i], y[i]))) return neq;
      return simpleCmp(x.length, y.length);
    }
    default: {
      if (typeA !== "object") {
        const isSameType = a?.constructor === b?.constructor;
        // short-cut when objects are the same type and have toString().
        if (isSameType && hasCustomString(a))
          return simpleCmp((a as Str).toString(), (b as Str).toString());
        // use constructor name order if different types
        if ((neq = simpleCmp(a?.constructor?.name, b?.constructor?.name)))
          return neq;
      }
      // plain objects
      const keysA = Object.keys(a as object).sort();
      const keysB = Object.keys(b as object).sort();
      if ((neq = mingoCmp(keysA, keysB))) return neq;
      for (const k of keysA)
        if ((neq = mingoCmp((a as AnyObject)[k], (b as AnyObject)[k])))
          return neq;
      return 0;
    }
  }
}

/**
 * Compare function which adheres to MongoDB comparison order.
 *
 * @param a The first value
 * @param b The second value
 * @returns {Number}
 */
export const compare = (a: Any, b: Any): number => mingoCmp(a, b, true);

type Stringer = { toString(): string };
const hasCustomString = (o: Any): o is Stringer =>
  o !== null && o !== undefined && o["toString"] !== Object.prototype.toString;

type Str = { toString: () => string };

/**
 * Determine whether two values are the same or strictly equivalent.
 * Checking whether values are the same only applies to built in objects.
 * For custom objects, they are equal only of their toString() representation are equal if defined.
 *
 * @param a The first value
 * @param b The second value
 * @return True if values are equivalent, false otherwise.
 */
export function isEqual(a: Any, b: Any): boolean {
  // strictly equal must be equal. matches referentially equal values.
  if (a === b || Object.is(a, b)) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (a.constructor !== b?.constructor) return false;
  if (isDate(a)) return isDate(b) && +a === +b;
  if (isRegExp(a))
    return isRegExp(b) && a.source === b.source && a.flags === b.flags;
  if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (a?.constructor !== Object && hasCustomString(a)) {
    return (a as Str)?.toString() === (b as Str)?.toString();
  }

  const objA = a as AnyObject;
  const objB = b as AnyObject;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    const k = keysA[i];
    if (
      !Object.prototype.hasOwnProperty.call(objB, k) ||
      !isEqual(objA[k], objB[k])
    )
      return false;
  }
  return true;
}

/**
 * A map implementation that uses value comparison for keys instead of referential identity.
 *
 * IMPORTANT! we assume objects are never modified once the hash is computed and put in the Map.
 * Modifying an object after adding to the Map will cause incorrect behaviour.
 */
export class HashMap<K, V> extends Map<K, V> {
  // maps the hashcode to key set
  #keyMap = new Map<number, K[]>();
  // returns a tuple of [<masterKey>, <hash>]. Expects an object key.
  #unpack = (key: K): [K, number] => {
    const hash = hashCode(key);
    const items = this.#keyMap.get(hash) ?? [];
    return [items.find(k => isEqual(k, key)), hash] as [K, number];
  };

  private constructor() {
    super();
  }

  /**
   * Returns a new {@link HashMap} object.
   * @param fn An optional custom hash function
   */
  static init<K, V>() {
    return new HashMap<K, V>();
  }

  clear(): void {
    super.clear();
    this.#keyMap.clear();
  }

  /**
   * @returns true if an element in the Map existed and has been removed, or false if the element does not exist.
   */
  delete(key: K): boolean {
    if (isPrimitive(key)) return super.delete(key);

    const [masterKey, hash] = this.#unpack(key);
    // nothing deleted
    if (!super.delete(masterKey)) return false;
    // filter out the deleted key
    this.#keyMap.set(
      hash,

      this.#keyMap.get(hash)!.filter(k => !isEqual(k, masterKey))
    );
    return true;
  }

  /**
   * Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
   * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
  get(key: K): V | undefined {
    if (isPrimitive(key)) return super.get(key);

    const [masterKey, _] = this.#unpack(key);
    return super.get(masterKey);
  }

  /**
   * @returns boolean indicating whether an element with the specified key exists or not.
   */
  has(key: K): boolean {
    if (isPrimitive(key)) return super.has(key);

    const [masterKey, _] = this.#unpack(key);
    return super.has(masterKey);
  }

  /**
   * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
   */
  set(key: K, value: V): this {
    if (isPrimitive(key)) return super.set(key, value);

    const [masterKey, hash] = this.#unpack(key);
    if (super.has(masterKey)) {
      // replace masterKey value
      super.set(masterKey, value);
    } else {
      // add new master key.
      super.set(key, value);
      // cache against hash code.
      const keys = this.#keyMap.get(hash) || [];
      keys.push(key);
      // cache the key
      this.#keyMap.set(hash, keys);
    }
    return this;
  }

  /**
   * @returns the number of elements in the Map.
   */
  get size(): number {
    return super.size;
  }
}

export function assert(condition: Any, msg: string): void {
  if (!condition) throw new MingoError(msg);
}

/**
 * Returns the name of type in lowercase including custom types.
 * @param v Any value
 */
export function typeOf(v: Any): string {
  if (v === null) return "null";
  const t = typeof v;
  // fast path for primitives - avoid hash lookup
  if (t === "number") return "number";
  if (t === "string") return "string";
  if (t === "boolean") return "boolean";
  if (t === "function") return "function";
  if (t === "symbol") return "symbol";
  if (t === "undefined") return "undefined";
  // object types
  if (isArray(v)) return "array";
  if (isDate(v)) return "date";
  if (isRegExp(v)) return "regexp";
  // native objects and custom types
  return v?.constructor?.name?.toLowerCase() ?? "object";
}
export const isBoolean = (v: Any): v is boolean => typeof v === "boolean";
export const isString = (v: Any): v is string => typeof v === "string";
export const isSymbol = (v: Any): boolean => typeof v === "symbol";
export const isNumber = (v: Any): v is number =>
  !Number.isNaN(v as number) && typeof v === "number";
export const isInteger = Number.isInteger;
export const isArray = Array.isArray;
export const isObject = (v: Any): v is AnyObject => {
  if (v === null || typeof v !== "object") return false;
  if (isArray(v) || isDate(v) || isRegExp(v)) return false;
  const ctor = v.constructor;
  return ctor === Object || ctor === undefined;
};
//  objects, arrays, functions, date, custom object
export const isObjectLike = (v: Any): boolean => !isPrimitive(v);
export const isDate = (v: Any): v is Date => v instanceof Date;
export const isRegExp = (v: Any): v is RegExp => v instanceof RegExp;
export const isFunction = (v: Any): boolean => typeof v === "function";
export const isNil = (v: Any): v is undefined => v === null || v === undefined;
export const truthy = (arg: Any, strict = true): boolean =>
  !!arg || (strict && arg === "");
export const isEmpty = (x: Any): boolean =>
  isNil(x) ||
  (isString(x) && !x) ||
  (isArray(x) && x.length === 0) ||
  (isObject(x) && Object.keys(x).length === 0);
/** ensure a value is an array or wrapped within one. */
export const ensureArray = <T>(x: T | T[]): T[] => (isArray(x) ? x : [x]);

export const has = (obj: object, ...props: string[]): boolean => {
  if (!obj) return false;
  for (let i = 0; i < props.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(obj, props[i])) return false;
  }
  return true;
};

const isTypedArray = (v: Any): v is ArrayBuffer =>
  typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(v);

/**
 * Deep clone an object.
 */
export const cloneDeep = <T>(v: T, refs?: WeakSet<object>): T => {
  if (isNil(v) || isBoolean(v) || isNumber(v) || isString(v)) return v;
  if (isDate(v)) return new Date(v) as T;
  if (isRegExp(v)) return new RegExp(v) as T;
  if (isTypedArray(v)) {
    const ctor = v.constructor as Constructor;
    return new ctor(v) as T;
  }
  if (!(refs instanceof WeakSet)) refs = new WeakSet();
  if (refs.has(v as object)) throw new Error(ERR_CYCLE_FOUND);
  refs.add(v as object);
  try {
    if (isArray(v)) {
      const arr = new Array<Any>(v.length);
      for (let i = 0; i < v.length; i++) arr[i] = cloneDeep(v[i], refs);
      return arr as T;
    }
    if (isObject(v)) {
      const obj: AnyObject = {};
      for (const k of Object.keys(v)) obj[k] = cloneDeep(v[k], refs);
      return obj as T;
    }
  } finally {
    refs.delete(v as object);
  }

  // custom-type. will be treated as immutable so return as is.
  return v;
};

/**
 * Returns the intersection of multiple arrays.
 *
 * @param  {Array} input An array of arrays from which to find intersection.
 * @return {Array} Array of intersecting values.
 */
export function intersection<T = Any>(input: T[][]): T[] {
  if (input.length === 0) return [];
  if (input.some(arr => arr.length === 0)) return [];
  if (input.length === 1) return input[0].slice();

  // fast path: use native Set.intersection() when all elements are primitives
  if (input.every(arr => arr.every(isPrimitive))) {
    let result = new Set(input[0]);
    for (let i = 1; i < input.length; i++) {
      result = result.intersection(new Set(input[i]));
      if (result.size === 0) return [];
    }
    return Array.from(result) as T[];
  }

  const vmaps = [HashMap.init<T, boolean>(), HashMap.init<T, boolean>()];
  // start with last array to ensure stableness.
  input[input.length - 1].forEach(v => vmaps[0].set(v, true));
  // process collection backwards.
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

/**
 * Flatten the array
 *
 * @param xs The array to flatten
 * @param depth The number of nested lists to iterate. @default 1
 */
export function flatten(xs: Any[], depth = 1): Any[] {
  const arr = new Array<Any>();
  function flatten2(ys: Any[], n: number) {
    for (let i = 0, len = ys.length; i < len; i++) {
      if (isArray(ys[i]) && (n > 0 || n < 0)) {
        flatten2(ys[i] as Any[], Math.max(-1, n - 1));
      } else {
        arr.push(ys[i]);
      }
    }
  }
  flatten2(xs, depth);
  return arr;
}

/**
 * Return a new unique version of the collection
 * @param  {Array} input The input collection
 * @return {Array}
 */
export function unique<T = Any>(input: T[]): T[] {
  // fast path: use native Set for primitives
  if (input.every(isPrimitive)) {
    return Array.from(new Set(input));
  }
  const m = HashMap.init<T, boolean>();
  input.forEach(v => m.set(v, true));
  return Array.from(m.keys());
}

/**
 * Groups the collection into sets by the returned key
 *
 * @param collection
 * @param keyFunc {Function} to compute the group key of an item in the collection
 */
export function groupBy<T = Any, K = Any>(
  collection: T[],
  keyFunc: (a: T, i: number) => K
): Map<K | null, T[]> {
  if (collection.length < 1) return new Map();

  // map of raw key values to matching objects of the same keyFn(obj).
  const result = HashMap.init<K | null, T[]>();
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

/**
 * Retrieve the value of a given key on an object
 * @param obj
 * @param key
 * @returns {*}
 * @private
 */
function getValue(obj: ArrayOrObject, key: string | number): Any {
  return isObjectLike(obj) ? (obj as AnyObject)[key] : undefined;
}

/**
 * Unwrap a single element array to specified depth
 * @param {Array} arr
 * @param {Number} depth
 * @private
 */
function unwrap(arr: Any[], depth: number): Any[] {
  if (depth < 1) return arr;
  while (depth-- && arr.length === 1 && isArray(arr[0])) arr = arr[0] as Any[];
  return arr;
}

/** Options to resolve() and resolveGraph() functions */
interface ResolveOptions {
  /** Unwrap the final array value.  */
  unwrapArray?: boolean;
  /** Replace "undefined" values with special MISSING symbol value. */
  preserveMissing?: boolean;
  /** Preserve values for untouched keys of objects. */
  preserveKeys?: boolean;
  /** Preserve untouched indexes in arrays. */
  preserveIndex?: boolean;
}

/**
 * Resolve the value of the field (dot separated) on the given object
 * @param obj {AnyObject} the object context
 * @param selector {String} dot separated path to field
 * @param options Optional resolve options
 * @param pathArray Optional pre-split path segments to avoid repeated string splitting
 * @returns {*}
 */
export function resolve(
  obj: ArrayOrObject,
  selector: string,
  options?: Pick<ResolveOptions, "unwrapArray">,
  pathArray?: string[]
): Any {
  if (isScalar(obj)) return obj;

  const path = pathArray || selector.split(".");

  // fast path for simple single-segment selectors on non-array objects (e.g., "active", "age")
  if (path.length === 1 && !isArray(obj)) {
    return getValue(obj, path[0]);
  }

  // fast path for 2-segment selectors on plain objects (e.g., "address.city")
  if (path.length === 2 && !isArray(obj)) {
    const first = getValue(obj, path[0]);
    if (first == null) return undefined;
    if (!isArray(first)) {
      return getValue(first as ArrayOrObject, path[1]);
    }
    // first is an array; fall through to general case
  }

  let depth = 0;
  function resolve2(o: ArrayOrObject, path: string[]): Any {
    let value: Any = o;
    for (let i = 0; i < path.length; i++) {
      const field = path[i];
      const isText = !isDigitStr(field);
      // using instanceof to aid typescript compiler
      if (isText && isArray(value)) {
        // On the first iteration, we check if we received a stop flag.
        // If so, we stop to prevent iterating over a nested array value
        // on consecutive object keys in the selector.
        if (i === 0 && depth > 0) break;
        depth += 1;
        // only look at the rest of the path
        const subpath = path.slice(i);
        value = value.reduce<Any[]>((acc: Any[], item: ArrayOrObject) => {
          const v = resolve2(item, subpath);
          if (v !== undefined) acc.push(v);
          return acc;
        }, []);
        break;
      } else {
        value = getValue(value as ArrayOrObject, field);
      }
      if (value === undefined) break;
    }
    return value;
  }

  const res = resolve2(obj, path);
  return isArray(res) && options?.unwrapArray ? unwrap(res, depth) : res;
}

/**
 * Returns the full object to the resolved value given by the selector.
 *
 * @param obj {AnyObject} the object context
 * @param selector {String} dot separated path to field
 */
export function resolveGraph(
  obj: ArrayOrObject,
  selector: string,
  options?: ResolveOptions
): ArrayOrObject | undefined {
  const sep = selector.indexOf(".");
  const key = sep == -1 ? selector : selector.substring(0, sep);
  const next = selector.substring(sep + 1);
  const hasNext = sep != -1;

  if (isArray(obj)) {
    // obj is an array
    const isIndex = isDigitStr(key);
    const arr = isIndex && options?.preserveIndex ? obj.slice() : [];
    if (isIndex) {
      const index = parseInt(key);
      let value = getValue(obj, index) as ArrayOrObject;
      if (hasNext) {
        value = resolveGraph(value, next, options)!;
      }
      if (options?.preserveIndex) {
        arr[index] = value;
      } else {
        arr.push(value);
      }
    } else {
      for (const item of obj) {
        const value = resolveGraph(item as ArrayOrObject, selector, options);
        if (options?.preserveMissing) {
          arr.push(value == undefined ? MISSING : value);
        } else if (value != undefined || options?.preserveIndex) {
          arr.push(value);
        }
      }
    }
    return arr as ArrayOrObject;
  }

  const res = options?.preserveKeys ? { ...obj } : {};
  let value = getValue(obj, key);
  if (hasNext) {
    value = resolveGraph(value as ArrayOrObject, next, options);
  }
  if (value === undefined) return undefined;
  res[key] = value;
  return res;
}

/**
 * Filter out all MISSING values from the object in-place
 *
 * @param obj The object to filter
 * @private
 */
export function filterMissing(obj: ArrayOrObject): void {
  if (isArray(obj)) {
    for (let i = obj.length - 1; i >= 0; i--) {
      if (obj[i] === MISSING) {
        obj.splice(i, 1);
      } else {
        filterMissing(obj[i] as ArrayOrObject);
      }
    }
  } else if (isObject(obj)) {
    for (const k of Object.keys(obj)) {
      if (has(obj, k)) {
        filterMissing(obj[k] as ArrayOrObject);
      }
    }
  }
}

/** Options passed to the walk function. */
export interface WalkOptions {
  buildGraph?: boolean;
  descendArray?: boolean;
}

export type Indexed = string | number;

/**
 * Walk the object graph and execute the given transform function
 *
 * @param  {AnyObject|Array} obj   The object to traverse.
 * @param  {String} selector    The selector to navigate.
 * @param  {Callback} fn Callback to execute for value at the end the traversal.
 * @param  {WalkOptions} options The opetions to use for the function.
 * @return {*}
 */
export function walk(
  obj: AnyObject,
  selector: string,
  fn: (_o: AnyObject, _k: string) => void,
  options?: WalkOptions
): void {
  const sep = selector.indexOf(".");
  const key = sep === -1 ? selector : selector.substring(0, sep);

  if (sep === -1) {
    if (isObject(obj) || (isArray(obj) && isDigitStr(key))) {
      fn(obj, key);
    }
  } else {
    const next = selector.substring(sep + 1);
    // force the rest of the graph while traversing
    if (options?.buildGraph && isNil(obj[key])) {
      obj[key] = {};
    }

    // get the next item
    const item = obj[key] as AnyObject;
    // nothing more to do
    if (!item) return;
    // we peek to see if next key is an array index.
    const nextSep = next.indexOf(".");
    const nextKey = nextSep === -1 ? next : next.substring(0, nextSep);
    const isNextArrayIndex = isDigitStr(nextKey);
    // if we have an array value but the next key is not an index and the 'descendArray' option is set,
    // we walk each item in the array separately. This allows for handling traversing keys for objects
    // nested within an array.
    //
    // Eg: Given { array: [ {k:1}, {k:2}, {k:3} ] }
    //  - individual objecs can be traversed with "array.k"
    //  - a specific object can be traversed with "array.1"
    if (isArray(item) && options?.descendArray && !isNextArrayIndex) {
      item.forEach(((e: AnyObject) =>
        walk(e, next, fn, options)) as Callback<void>);
    } else {
      walk(item, next, fn, options);
    }
  }
}

/**
 * Set the value of the given object field
 *
 * @param obj {AnyObject|Array} the object context
 * @param selector {String} path to field
 * @param value {*} the value to set.
 */
export function setValue(obj: AnyObject, selector: string, value: Any): void {
  walk(obj, selector, (item: AnyObject, key: Indexed) => (item[key] = value), {
    buildGraph: true
  });
}

/**
 * Removes an element from the container.
 * If the selector resolves to an array and the leaf is a non-numeric key,
 * the remove operation will be performed on objects of the array.
 *
 * @param obj {ArrayOrObject} object or array
 * @param selector {String} dot separated path to element to remove
 */
export function removeValue(
  obj: AnyObject,
  selector: string,
  options?: Pick<WalkOptions, "descendArray">
): void {
  walk(
    obj,
    selector,
    ((item: Any, key: string) => {
      if (isArray(item)) {
        item.splice(parseInt(key), 1);
      } else if (isObject(item)) {
        delete item[key];
      }
    }) as Callback<void>,
    options
  );
}

/**
 * Check whether the given name passes for an operator. We assume AnyVal field name starting with '$' is an operator.
 * This is cheap and safe to do since keys beginning with '$' should be reserved for internal use.
 * @param {String} name
 */
export const isOperator = (name: string): boolean => {
  if (!name || name.length < 2 || name.charCodeAt(0) !== 0x24 /*$*/) {
    return false;
  }
  for (let i = 1; i < name.length; i++) {
    const c = name.charCodeAt(i);
    if (
      !(
        (c >= 97 && c <= 122) || // a-z
        (c >= 65 && c <= 90) || // A-Z
        (c >= 48 && c <= 57) || // 0-9
        c === 95 // _
      )
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Simplify expression for easy evaluation with query operators map
 * @param expr
 * @returns {*}
 */
export function normalize(expr: Any): Any {
  if (isScalar(expr)) {
    return isRegExp(expr) ? { $regex: expr } : { $eq: expr };
  }

  // normalize object expression. using ObjectLike handles custom types
  if (isObjectLike(expr)) {
    // no valid query operator found, so we do simple comparison
    let hasOp = false;
    const keys = Object.keys(expr as AnyObject);
    for (let i = 0; i < keys.length; i++) {
      if (isOperator(keys[i])) {
        hasOp = true;
        break;
      }
    }
    if (!hasOp) return { $eq: expr };
    // ensure valid regex
    if (isObject(expr) && has(expr, "$regex")) {
      const newExpr = { ...expr };
      newExpr["$regex"] = new RegExp(
        expr["$regex"] as string,
        expr["$options"] as string
      );
      delete newExpr["$options"];
      return newExpr;
    }
  }

  return expr;
}

/**
 * Find the insert index for the given key in a sorted array.
 *
 * @param sorted The sorted array to search
 * @param item The search key
 * @param comparator Optional custom compare function
 */
export function findInsertIndex<T = Any>(
  sorted: T[],
  item: T,
  comparator: Comparator<T> = compare
): number {
  // uses binary search
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

interface PathNode {
  children: Map<string, PathNode>;
  isTerminal: boolean;
}

/** Simple to trie for validating path conflicts */
export class PathValidator {
  private root: PathNode;

  constructor() {
    this.root = {
      children: new Map<string, PathNode>(),
      isTerminal: false
    };
  }

  add(selector: string): boolean {
    const parts = selector.split(".");
    let current = this.root;

    for (const part of parts) {
      if (current.isTerminal) return false;

      if (!current.children.has(part)) {
        current.children.set(part, {
          children: new Map<string, PathNode>(),
          isTerminal: false
        });
      }

      current = current.children.get(part)!;
    }
    // selector path already exists (i.e. either terminal or has children)
    if (current.isTerminal || current.children.size) return false;
    return (current.isTerminal = true);
  }
}
