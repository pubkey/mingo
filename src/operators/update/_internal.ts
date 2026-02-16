import { ComputeOptions, Context } from "../../core/_internal";
import * as booleanOperators from "../../operators/expression/boolean";
import * as comparisonOperators from "../../operators/expression/comparison";
import * as queryOperators from "../../operators/query";
import { Query } from "../../query";
import { Any, AnyObject, Options } from "../../types";
import {
  assert,
  cloneDeep,
  isArray,
  isDate,
  isObject,
  isRegExp,
  PathValidator,
  resolve,
  walk,
  WalkOptions
} from "../../util/_internal";

export type SingleKeyRecord<K extends PropertyKey, V> = {
  [P in K]: Record<P, V>;
}[K];

export const DEFAULT_OPTIONS: Options = ComputeOptions.init({
  context: Context.init()
    .addQueryOps(queryOperators)
    .addExpressionOps(booleanOperators)
    .addExpressionOps(comparisonOperators)
}).update({ updateConfig: { cloneMode: "copy" } });

export const clone = (val: Any, opts: Options): Any => {
  const mode =
    (opts as ComputeOptions)?.local?.updateConfig?.cloneMode ?? "copy";
  switch (mode) {
    case "deep":
      return cloneDeep(val);
    case "copy": {
      if (isDate(val)) return new Date(val);
      if (isArray(val)) return (val as Any[]).slice();
      if (isObject(val)) return Object.assign({}, val);
      if (isRegExp(val)) return new RegExp(val);
      return val;
    }
    default:
      return val;
  }
};

export type PathNode = {
  selector: string;
  position?: string;
  next?: PathNode;
};

// positional array specifier for first matching item.
const FIRST_ONLY = "$";
// positional array-wide specifier for all items in matching array.
const ARRAY_WIDE = "$[]";

/**
 * Applies an update function to a value to produce a new value to modify an object in-place.
 * @param o The object or array to modify.
 * @param n The path node of the update selector.
 * @param q Map of positional identifiers to queries for filtering.
 * @param f The update function which accepts containver value and key.
 * @param opts The optional {@link WalkOptions} passed to the walk function.
 */
export const applyUpdate = (
  o: AnyObject,
  n: PathNode,
  q: Record<string, Query>,
  f: (_o: AnyObject, _k: string) => boolean,
  opts?: WalkOptions
): boolean => {
  const { selector, position: c, next } = n;
  if (!c) {
    // wrapper to collect status
    let b = false;
    const g: typeof f = (u, k) => (b = Boolean(f(u, k)) || b);
    walk(o, selector, g, opts);
    return b;
  }
  const arr = resolve(o, selector) as AnyObject;
  // no update applied if we do not get correct type.
  if (!isArray(arr) || !arr.length) return false;

  if (c === FIRST_ONLY) {
    const i = arr.findIndex(e => q[selector].test({ [selector]: [e] }));
    if (i === -1) return false;
    return next
      ? applyUpdate(arr[i] as AnyObject, next, q, f, opts)
      : f(arr, i as Any as string);
  }

  // apply update to matching items.
  return arr
    .map((e, i) => {
      // filter if applicable.
      if (c !== ARRAY_WIDE && q[c] && !q[c].test({ [c]: [e] })) return false;
      // apply update.
      return next
        ? applyUpdate(e as AnyObject, next, q, f, opts)
        : f(arr, i as Any as string);
    })
    .some(Boolean);
};

export type Action<T> = (
  val: T,
  pathNode: PathNode,
  queries: Record<string, Query>
) => boolean;

const ERR_MISSING_FIELD =
  "You must include the array field for '.$' as part of the query document.";

const ERR_IMMUTABLE_FIELD = (path: string, idKey: string) =>
  `Performing an update on the path '${path}' would modify the immutable field '${idKey}'.`;

/**
 * Walks the expression and apply the given action for each key-value pair.
 *
 * @param expr The expression for the update operator.
 * @param arrayFilters Filter conditions passed to the operator.
 * @param options The options provided by the caller.
 * @param callback The action to apply for a given path and value.
 * @returns {Any[]<string>}
 */
export function walkExpression<T>(
  expr: AnyObject,
  arrayFilters: AnyObject[],
  options: Options,
  callback: Action<T>
): string[] {
  const opts =
    options instanceof ComputeOptions ? options : ComputeOptions.init(options);
  const params =
    opts.local.updateParams ?? buildParams([expr], arrayFilters, opts);

  const modified: string[] = [];
  for (const [key, val] of Object.entries(expr)) {
    const { node, queries } = params[key];
    if (callback(val as T, node, queries)) modified.push(node.selector);
  }

  return modified.sort();
}

/**
 * Builds a map of parameters for update operations, where each parameter is associated
 * with its corresponding path node and query conditions. Conflicting selectors are detected.
 */
export function buildParams(
  exprList: AnyObject[],
  arrayFilters: AnyObject[],
  options: ComputeOptions
): Record<string, { node: PathNode; queries: Record<string, Query> }> {
  // map of (selector -> { node, queries})
  const params: ReturnType<typeof buildParams> = {};

  arrayFilters ||= [];

  // group filters by root field. handles multiple keys per filter object.
  const filterIndexMap = arrayFilters.reduce(
    (res: Record<string, AnyObject>, filter) => {
      for (const k of Object.keys(filter)) {
        const parent = k.split(".")[0];
        if (res[parent]) {
          res[parent][k] = filter[k];
        } else {
          res[parent] = { [k]: filter[k] };
        }
      }
      return res;
    },
    {}
  );

  let { condition } = options.local;
  condition = condition ?? {};
  const queryKeys = Object.keys(condition);
  const conflictDetector = new PathValidator();

  for (const expr of exprList) {
    for (const selector of Object.keys(expr)) {
      const identifiers: string[] = [];
      const node: PathNode = selector.includes("$")
        ? { selector: "" }
        : { selector };

      if (!node.selector) {
        selector.split(".").reduce((n, v) => {
          if (v === FIRST_ONLY || v === ARRAY_WIDE) {
            n.position = v;
          } else if (v.startsWith("$[") && v.endsWith("]")) {
            const id = v.slice(2, -1);
            assert(
              /^[a-z]+\w*$/.test(id),
              `The filter <identifier> must begin with a lowercase letter and contain only alphanumeric characters. '${v}' is invalid.`
            );
            identifiers.push(id);
            n.position = id;
          } else if (!n.selector) {
            n.selector = v;
          } else if (!n.position) {
            n.selector += "." + v;
          } else {
            n.next = { selector: v };
            return n.next;
          }

          return n;
        }, node);
      }

      const queries: Record<string, Query> = {};
      if (identifiers.length) {
        // extract filters for each identifier
        const filters: Record<string, AnyObject> = {};
        identifiers.forEach(v => (filters[v] = filterIndexMap[v]));
        // create query for each filter
        for (const [k, c] of Object.entries(filters)) {
          queries[k] = new Query(c, options);
        }
      }

      if (node.position === FIRST_ONLY) {
        const field = node.selector;
        assert(queryKeys && queryKeys.length, ERR_MISSING_FIELD);
        const matches = queryKeys.filter(
          k => k === field || k.startsWith(field + ".")
        );
        assert(matches.length === 1, ERR_MISSING_FIELD);
        const k = matches[0];
        // add query for matching condition.
        queries[field] = new Query({ [k]: condition[k] }, options);
      }

      // assert id field is not being modified (MongoDB immutability constraint)
      const idKey = options.idKey;
      assert(
        node.selector !== idKey && !node.selector.startsWith(`${idKey}.`),
        ERR_IMMUTABLE_FIELD(node.selector, idKey)
      );

      // assert there are no conflicting selectors
      assert(
        conflictDetector.add(node.selector),
        `updating the path '${node.selector}' would create a conflict at '${node.selector}'`
      );

      // save arguments for evaluation
      params[selector] = { node, queries };
    }
  }

  return params;
}

export type UpdateParams = ReturnType<typeof buildParams>;

export type UpdateOperator = (
  expr: Any,
  arrayFilters: AnyObject[],
  options: Options
) => (obj: AnyObject) => string[];
