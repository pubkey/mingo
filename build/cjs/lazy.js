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
var lazy_exports = {};
__export(lazy_exports, {
  Iterator: () => Iterator,
  Lazy: () => Lazy,
  concat: () => concat
});
module.exports = __toCommonJS(lazy_exports);
var import_util = require("./util");
function Lazy(source) {
  return new Iterator(source);
}
function concat(...iterators) {
  let index = 0;
  return Lazy(() => {
    while (index < iterators.length) {
      const o = iterators[index].next();
      if (!o.done) return o;
      index++;
    }
    return { done: true, value: void 0 };
  });
}
function isGenerator(o) {
  return !!o && typeof o === "object" && typeof o?.next === "function";
}
function isIterable(o) {
  return !!o && (typeof o === "object" || typeof o === "function") && typeof o[Symbol.iterator] === "function";
}
class Iterator {
  #iteratees = [];
  #buffer = [];
  #getNext;
  #done = false;
  constructor(source) {
    let iter;
    if (isIterable(source))
      iter = source[Symbol.iterator]();
    else if (isGenerator(source)) iter = source;
    else if (typeof source === "function") iter = { next: source };
    else
      (0, import_util.assert)(0, "mingo: iterator requires an iterable, generator or function");
    let index = -1;
    this.#getNext = () => {
      while (true) {
        let { value, done } = iter.next();
        if (done) return { done };
        let ok = true;
        index++;
        for (let i = 0; i < this.#iteratees.length; i++) {
          const { op, fn } = this.#iteratees[i];
          const res = fn(value, index);
          if (op === "map") {
            value = res;
          } else if (!res) {
            ok = false;
            break;
          }
        }
        if (ok) return { value, done };
      }
    };
  }
  /**
   * Add an iteratee to this lazy sequence
   */
  push(op, fn) {
    this.#iteratees.push({ op, fn });
    return this;
  }
  next() {
    return this.#getNext();
  }
  // Iteratees methods
  /**
   * Transform each item in the sequence to a new value
   * @param {Function} f
   */
  map(f) {
    return this.push("map", f);
  }
  /**
   * Select only items matching the given predicate
   * @param {Function} f
   */
  filter(f) {
    return this.push("filter", f);
  }
  /**
   * Take given numbe for values from sequence
   * @param {Number} n A number greater than 0
   */
  take(n) {
    (0, import_util.assert)(n >= 0, "value must be a non-negative integer");
    return this.filter((_) => n-- > 0);
  }
  /**
   * Drop a number of values from the sequence
   * @param {Number} n Number of items to drop greater than 0
   */
  drop(n) {
    (0, import_util.assert)(n >= 0, "value must be a non-negative integer");
    return this.filter((_) => n-- <= 0);
  }
  // Transformations
  /**
   * Returns a new lazy object with results of the transformation
   * The entire sequence is realized.
   *
   * @param {Callback<Source, Any[]>} f Tranform function of type (Array) => (Any)
   */
  transform(f) {
    const self = this;
    let iter;
    return Lazy(() => {
      if (!iter) iter = f(self.collect());
      return iter.next();
    });
  }
  /**
   * Retrieves all remaining values from the lazy evaluation and returns them as an array.
   * This method processes the underlying iterator until it is exhausted, storing the results
   * in an internal buffer to ensure subsequent calls return the same data.
   */
  collect() {
    while (!this.#done) {
      const { done, value } = this.#getNext();
      if (!done) this.#buffer.push(value);
      this.#done = done;
    }
    return this.#buffer;
  }
  /**
   * Execute the callback for each value.
   * @param f The callback function.
   */
  each(f) {
    for (let o = this.next(); o.done !== true; o = this.next()) f(o.value);
  }
  /**
   * Returns the reduction of sequence according the reducing function
   *
   * @param f The reducing function
   * @param initialValue The initial value
   */
  reduce(f, initialValue) {
    let o = this.next();
    if (initialValue === void 0 && !o.done) {
      initialValue = o.value;
      o = this.next();
    }
    while (!o.done) {
      initialValue = f(initialValue, o.value);
      o = this.next();
    }
    return initialValue;
  }
  /**
   * Returns the number of matched items in the sequence.
   * The stream is realized and buffered for later retrieval with {@link collect}.
   */
  size() {
    return this.collect().length;
  }
  [Symbol.iterator]() {
    return this;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Iterator,
  Lazy,
  concat
});
