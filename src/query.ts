import { ComputeOptions, OpType } from "./core/_internal";
import { Cursor } from "./cursor";
import { Source } from "./lazy";
import type {
  Any,
  AnyObject,
  Callback,
  Criteria,
  Options,
  Predicate,
  Projection
} from "./types";
import { assert, cloneDeep, isObject, isOperator, normalize } from "./util";

const TOP_LEVEL_OPS = new Set(["$and", "$or", "$nor", "$expr", "$jsonSchema"]);

/**
 * Represents a query object used to filter and match documents based on specified criteria.
 * All query, projection, and related expression operators are preloaded into the context by default.
 *
 * @example
 * ```typescript
 * const query = new Query({ age: { $gt: 18 } });
 * const result = query.test({ name: "John", age: 25 }); // true
 * ```
 */
export class Query<T = AnyObject> {
  #compiled: Predicate<Any>[];
  #condition: Criteria<T>;
  #options: Options;

  /**
   * Creates an instance of the query with the specified condition and options.
   * This object is preloaded with all query and projection operators.
   *
   * @param condition - The query condition object used to define the criteria for matching documents.
   * @param options - Optional configuration settings to customize the query behavior.
   */
  constructor(condition: Criteria<T>, options: Partial<Options>) {
    this.#condition = cloneDeep(condition);
    this.#options = ComputeOptions.init(options).update({
      condition: condition
    });
    this.#compiled = [];
    this.compile();
  }

  private compile(): void {
    assert(
      isObject(this.#condition),
      `query criteria must be an object: ${JSON.stringify(this.#condition)}`
    );

    const whereOperator: { field?: string; expr?: Any } = {};
    const conditions = Object.keys(this.#condition);
    for (let ci = 0; ci < conditions.length; ci++) {
      const field = conditions[ci];
      const expr = (this.#condition as AnyObject)[field];
      if ("$where" === field) {
        assert(
          this.#options.scriptEnabled,
          "$where operator requires 'scriptEnabled' option to be true."
        );
        Object.assign(whereOperator, { field: field, expr: expr });
      } else if (TOP_LEVEL_OPS.has(field)) {
        this.processOperator(field, field, expr);
      } else {
        // normalize expression
        assert(!isOperator(field), `unknown top level operator: ${field}`);
        const normalized = normalize(expr) as AnyObject;
        const normKeys = Object.keys(normalized);
        for (let ni = 0; ni < normKeys.length; ni++) {
          this.processOperator(field, normKeys[ni], normalized[normKeys[ni]]);
        }
      }

      if (whereOperator.field) {
        this.processOperator(
          whereOperator.field,
          whereOperator.field,
          whereOperator.expr
        );
      }
    }
  }

  private processOperator(field: string, operator: string, value: Any): void {
    const fn = this.#options.context.getOperator(
      OpType.QUERY,
      operator
    ) as Callback<Predicate>;
    assert(!!fn, `unknown query operator ${operator}`);
    this.#compiled.push(fn(field, value, this.#options));
  }

  /**
   * Tests whether the given object satisfies all compiled predicates.
   *
   * @template T - The type of the object to test.
   * @param obj - The object to be tested against the compiled predicates.
   * @returns `true` if the object satisfies all predicates, otherwise `false`.
   */
  test(obj: T): boolean {
    return this.#compiled.every(p => p(obj));
  }

  /**
   * Returns a cursor for iterating over the items in the given collection that match the query criteria.
   *
   * @typeParam T - The type of the items in the resulting cursor.
   * @param collection - The source collection to search through.
   * @param projection - An optional object specifying fields to include or exclude
   *                      in the returned items.
   * @returns A `Cursor` instance for iterating over the matching items.
   */
  find<R>(collection: Source, projection?: Projection<R>): Cursor<R> {
    return new Cursor<R>(
      collection,
      o => this.test(o as T),
      projection || {},
      this.#options
    );
  }
}
