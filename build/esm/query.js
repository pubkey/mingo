import { ComputeOptions, OpType } from "./core/_internal";
import { Cursor } from "./cursor";
import { assert, cloneDeep, isObject, isOperator, normalize } from "./util";
const TOP_LEVEL_RE = /^\$(and|or|nor|expr|jsonSchema)$/;
class Query {
  #compiled;
  #condition;
  #options;
  /**
   * Creates an instance of the query with the specified condition and options.
   * This object is preloaded with all query and projection operators.
   *
   * @param condition - The query condition object used to define the criteria for matching documents.
   * @param options - Optional configuration settings to customize the query behavior.
   */
  constructor(condition, options) {
    this.#condition = cloneDeep(condition);
    this.#options = ComputeOptions.init(options).update({
      condition
    });
    this.#compiled = [];
    this.compile();
  }
  compile() {
    assert(
      isObject(this.#condition),
      `query criteria must be an object: ${JSON.stringify(this.#condition)}`
    );
    const whereOperator = {};
    const conditions = Object.entries(this.#condition);
    for (const [field, expr] of conditions) {
      if ("$where" === field) {
        assert(
          this.#options.scriptEnabled,
          "$where operator requires 'scriptEnabled' option to be true."
        );
        Object.assign(whereOperator, { field, expr });
      } else if (TOP_LEVEL_RE.test(field)) {
        this.processOperator(field, field, expr);
      } else {
        assert(!isOperator(field), `unknown top level operator: ${field}`);
        for (const [operator, val] of Object.entries(
          normalize(expr)
        )) {
          this.processOperator(field, operator, val);
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
  processOperator(field, operator, value) {
    const fn = this.#options.context.getOperator(
      OpType.QUERY,
      operator
    );
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
  test(obj) {
    return this.#compiled.every((p) => p(obj));
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
  find(collection, projection) {
    return new Cursor(
      collection,
      (o) => this.test(o),
      projection || {},
      this.#options
    );
  }
}
export {
  Query
};
