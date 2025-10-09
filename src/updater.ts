import { ComputeOptions, UpdateOperator, UpdateOptions } from "./core";
import * as UPDATE_OPERATORS from "./operators/update";
import { UPDATE_OPTIONS } from "./operators/update/_internal";
import { Query } from "./query";
import { AnyObject } from "./types";
import { assert, has } from "./util";

// https://stackoverflow.com/questions/60872063/enforce-typescript-object-has-exactly-one-key-from-a-set
/** Define maps to enforce a single key from a union. */
// eslint-disable-next-line
type OneKey<K extends keyof any, V, KK extends keyof any = K> = {
  [P in K]: { [Q in P]: V } & { [Q in Exclude<KK, P>]?: never } extends infer O
    ? { [Q in keyof O]: O[Q] }
    : never;
}[K];

export type UpdateExpression = OneKey<keyof typeof UPDATE_OPERATORS, AnyObject>;

/** A function to process an update expression and modify the object. */
export type Updater = (
  obj: AnyObject,
  expr: UpdateExpression,
  arrayFilters?: AnyObject[],
  condition?: AnyObject,
  options?: UpdateOptions
) => string[];

/**
 * Creates a new updater function with default options.
 * @param defaultOptions The default options. Defaults to no cloning with strict mode off for queries.
 * @returns {Updater}
 */
export function createUpdater(defaultOptions?: UpdateOptions): Updater {
  // automatically load basic query options for update operators
  defaultOptions = defaultOptions ?? UPDATE_OPTIONS;

  return (
    obj: AnyObject,
    expr: UpdateExpression,
    arrayFilters: AnyObject[] = [],
    condition: AnyObject = {},
    options: UpdateOptions = defaultOptions
  ): string[] => {
    const entry = Object.entries(expr);
    // check for single entry
    assert(
      entry.length === 1,
      "Update expression must contain only one operator."
    );
    const [op, args] = entry[0];
    // check operator exists
    assert(
      has(UPDATE_OPERATORS, op),
      `Update operator '${op}' is not supported.`
    );
    /*eslint import/namespace: ['error', { allowComputed: true }]*/
    const mutate = UPDATE_OPERATORS[op] as UpdateOperator;
    const copts = ComputeOptions.init(options.queryOptions);
    // validate condition
    if (Object.keys(condition).length) {
      const q = new Query(condition, options.queryOptions);
      if (!q.test(obj)) return [] as string[];
      // set the condtion on the options
      copts.update({ condition });
    }
    // apply updates
    return mutate(obj, args, arrayFilters, { ...options, queryOptions: copts });
  };
}

/**
 * Updates the given object with the expression.
 *
 * @param obj The object to update.
 * @param expr The update expressions.
 * @param arrayFilters Filters to apply to nested items.
 * @param conditions Conditions to validate before performing update.
 * @param options Update options to override defaults.
 * @returns {string[]} A list of modified field paths in the object.
 */
export const update = createUpdater();

/**
 * @deprecated Use {@link update}.
 */
export const updateObject = update;
