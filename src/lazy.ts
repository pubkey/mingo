import { Any, AnyObject, Callback } from "./types";
import { assert } from "./util";

/**
 * A value produced by a generator
 */
export interface IteratorResult {
  readonly value?: Any;
  readonly done: boolean;
}

/**
 * Represents a stream interface that provides a method to retrieve the next item in a sequence.
 */
export interface Generator {
  next: () => IteratorResult;
}

export type Source = Generator | Callback<IteratorResult> | Iterable<Any>;

/**
 * Creates a lazy iterator from the given source.
 */
export function Lazy(source: Source): Iterator {
  return source instanceof Iterator ? source : new Iterator(source);
}

/**
 * Concatenate multiple iterators and return a new iterator.
 *
 * @param iterators The iterators to concatenate
 * @returns {Iterator} A new iterator
 */
export function concat(...iterators: Iterator[]): Iterator {
  let index = 0;
  return Lazy(() => {
    while (index < iterators.length) {
      const o = iterators[index].next();
      if (!o.done) return o;
      index++;
    }
    return { done: true, value: undefined };
  });
}

/**
 * Checks whether the given object is compatible with a generator i.e Object{next:Function}
 * @param {*} o An object
 */
function isGenerator(o: Any) {
  return (
    !!o && typeof o === "object" && typeof (o as AnyObject)?.next === "function"
  );
}

function isIterable(o: Any) {
  return (
    !!o &&
    (typeof o === "object" || typeof o === "function") &&
    typeof o[Symbol.iterator] === "function"
  );
}

interface Iteratee {
  op: "map" | "filter";
  fn: Callback<Any>;
}

/**
 * A lazy collection iterator yields a single value at a time upon request.
 */
export class Iterator {
  #iteratees: Iteratee[] = [];
  #buffer: Any[] = [];
  #getNext: Callback<IteratorResult, boolean>;
  #done = false;

  constructor(source: Source) {
    const iter: Generator = isIterable(source)
      ? ((source as Iterable<Any>)[Symbol.iterator]() as Generator)
      : isGenerator(source)
        ? (source as Generator)
        : typeof source === "function"
          ? { next: source }
          : null;

    assert(
      !!iter,
      `Iterator must be initialized with an iterable or function.`
    );

    // index of successfully transformed and yielded item
    let index = -1;
    // current item
    let current: IteratorResult = { done: false };
    // create function to yield the next transformed value
    this.#getNext = () => {
      while (!current.done) {
        current = iter.next();
        if (current.done) break;
        let value = current.value;
        index++;
        const ok = this.#iteratees.every(({ op: action, fn }) => {
          const res = fn(value, index);
          return action === "map" ? !!(value = res) || true : res;
        });
        if (ok) return { value, done: false };
      }
      return { done: true };
    };
  }

  /**
   * Add an iteratee to this lazy sequence
   */
  private push(op: "map" | "filter", fn: Callback<Any>) {
    this.#iteratees.push({ op, fn });
    return this;
  }

  next(): IteratorResult {
    return this.#getNext();
  }

  // Iteratees methods

  /**
   * Transform each item in the sequence to a new value
   * @param {Function} f
   */
  map<R, T = R>(f: (o: T, n: number) => R): Iterator {
    return this.push("map", f);
  }

  /**
   * Select only items matching the given predicate
   * @param {Function} f
   */
  filter<T>(f: (o: T, n: number) => boolean): Iterator {
    return this.push("filter", f as Callback<T>);
  }

  /**
   * Take given numbe for values from sequence
   * @param {Number} n A number greater than 0
   */
  take(n: number): Iterator {
    return n > 0 ? this.filter((_: Any) => !(n === 0 || n-- === 0)) : this;
  }

  /**
   * Drop a number of values from the sequence
   * @param {Number} n Number of items to drop greater than 0
   */
  drop(n: number): Iterator {
    return n > 0 ? this.filter((_: Any) => n === 0 || n-- === 0) : this;
  }

  // Transformations

  /**
   * Returns a new lazy object with results of the transformation
   * The entire sequence is realized.
   *
   * @param {Callback<Source, Any[]>} f Tranform function of type (Array) => (Any)
   */
  transform(f: Callback<Source, Any[]>): Iterator {
    const self = this;
    let iter: Iterator;
    return Lazy(() => {
      if (!iter) iter = Lazy(f(self.collect()));
      return iter.next();
    });
  }

  /**
   * Retrieves all remaining values from the lazy evaluation and returns them as an array.
   * This method processes the underlying iterator until it is exhausted, storing the results
   * in an internal buffer to ensure subsequent calls return the same data.
   */
  collect<T>(): T[] {
    while (!this.#done) {
      const { done, value } = this.#getNext();
      if (!done) this.#buffer.push(value);
      this.#done = done;
    }
    return this.#buffer as T[];
  }

  /**
   * Execute the callback for each value.
   * @param f The callback function.
   * @returns {Boolean} Returns false if the callback returned false to break the loop, otherwise true.
   */
  each<T>(f: Callback<T>): boolean {
    for (;;) {
      const o = this.next();
      if (o.done) break;
      if (f(o.value) === false) return false;
    }
    return true;
  }

  /**
   * Returns the reduction of sequence according the reducing function
   *
   * @param f The reducing function
   * @param initialValue The initial value
   */
  reduce<T>(f: Callback<T>, initialValue?: T): T {
    let o = this.next();

    if (initialValue === undefined && !o.done) {
      initialValue = o.value as T;
      o = this.next();
    }

    while (!o.done) {
      initialValue = f(initialValue, o.value as T);
      o = this.next();
    }

    return initialValue;
  }

  /**
   * Returns the number of matched items in the sequence.
   * The stream is realized and buffered for later retrieval with {@link collect}.
   */
  size(): number {
    return this.collect().length;
  }

  [Symbol.iterator](): Iterator {
    return this;
  }
}
