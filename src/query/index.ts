import { ComputeOptions, Options } from "../core";
import * as booleanOperators from "../operators/expression/boolean";
import * as comparisonOperators from "../operators/expression/comparison";
import * as projectionOperators from "../operators/projection";
import * as queryOperators from "../operators/query";
import { AnyObject } from "../types";
import { QueryImpl } from "./_internal";

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
export class Query extends QueryImpl {
  /**
   * Creates an instance of the query with the specified condition and options.
   * This object is preloaded with all query and projection operators.
   *
   * @param condition - The query condition object used to define the criteria for matching documents.
   * @param options - Optional configuration settings to customize the query behavior.
   */
  constructor(condition: AnyObject, options?: Partial<Options>) {
    const opts = ComputeOptions.init(options);
    opts.context
      .addExpressionOps(booleanOperators)
      .addExpressionOps(comparisonOperators)
      .addProjectionOps(projectionOperators)
      .addQueryOps(queryOperators);
    super(condition, opts);
  }
}
