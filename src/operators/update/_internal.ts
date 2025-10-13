import { CloneMode, ComputeOptions, Context, UpdateOptions } from "../../core";
import * as booleanOperators from "../../operators/expression/boolean";
import * as comparisonOperators from "../../operators/expression/comparison";
import * as queryOperators from "../../operators/query";
import type { Query } from "../../query";
import { QueryImpl } from "../../query/_internal";
import { Any, AnyObject, ArrayOrObject, Callback } from "../../types";
import {
  assert,
  cloneDeep,
  isArray,
  isDate,
  isObject,
  isRegExp,
  resolve,
  walk,
  WalkOptions
} from "../../util";

export const DEFAULT_OPTIONS: UpdateOptions = {
  cloneMode: "copy",
  queryOptions: ComputeOptions.init({
    context: Context.init()
      .addQueryOps(queryOperators)
      .addExpressionOps(booleanOperators)
      .addExpressionOps(comparisonOperators)
  })
};

export const clone = (mode: CloneMode, val: Any): Any => {
  switch (mode) {
    case "deep":
      return cloneDeep(val);
    case "copy": {
      if (isDate(val)) return new Date(val);
      if (isArray(val)) return [...(val as Any[])];
      if (isObject(val)) return { ...val };
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
 * Tokenize a selector path to extract parts for the {@link PathNode} and arrayFilter keys
 */
export function tokenizePath(selector: string): [PathNode, string[]] {
  // no positional operator found
  if (!selector.includes("$")) {
    return [{ selector }, []];
  }

  const nodes: PathNode[] = [];
  const idents: string[] = [];
  let i = 0;

  for (const field of selector.split(".")) {
    // setup current node
    if (i === nodes.length) {
      nodes.push({ selector: undefined });
      // point to new node
      if (i > 0) nodes[i - 1].next = nodes[i];
    }
    // build path with selectors
    if (field[0] !== FIRST_ONLY) {
      if (!nodes[i].selector) nodes[i].selector = field;
      else nodes[i].selector += "." + field;
    } else if (field === FIRST_ONLY || field === ARRAY_WIDE) {
      nodes[i++].position = field;
    } else {
      assert(
        field.startsWith("$[") && field.endsWith("]"),
        "invalid filtered positional array selector"
      );
      // filtered positional
      const position = field.slice(2, -1);
      assert(
        /^[a-z]+[a-zA-Z0-9]*$/.test(position),
        "The filter <identifier> must begin with a lowercase letter and contain only alphanumeric characters."
      );
      idents.push(position);
      nodes[i++].position = position;
    }
  }
  return [nodes[0], idents];
}

/**
 * Applies an update function to a value to produce a new value to modify an object in-place.
 * @param o The object or array to modify.
 * @param n The path node of the update selector.
 * @param q Map of positional identifiers to queries for filtering.
 * @param f The update function which accepts containver value and key.
 * @param opts The optional {@link WalkOptions} passed to the walk function.
 */
export const applyUpdate = (
  o: ArrayOrObject,
  n: PathNode,
  q: Record<string, QueryImpl>,
  f: Callback<boolean>,
  opts?: WalkOptions
): boolean => {
  const { selector, position: c, next } = n;
  if (!c) {
    // wrapper to collect status
    let b = false;
    const g: Callback<void> = (u, k) => (b = Boolean(f(u, k)) || b);
    walk(o, selector, g, opts);
    return b;
  }
  const arr = resolve(o, selector) as Any[];
  // do nothing if we don't get correct type.
  if (!isArray(arr) || !arr.length) return false;

  if (c === FIRST_ONLY) {
    const i = arr.findIndex(e => q[selector].test({ [selector]: [e] }));
    if (i === -1) return false;
    return next
      ? applyUpdate(arr[i] as AnyObject, next, q, f, opts)
      : f(arr, i);
  }

  // apply update to matching items.
  return arr
    .map((e: AnyObject, i) => {
      // filter if applicable.
      if (c !== ARRAY_WIDE && q[c] && !q[c].test({ [c]: [e] })) return false;
      // apply update.
      return next
        ? applyUpdate(e as ArrayOrObject, next, q, f, opts)
        : f(arr, i);
    })
    .some(Boolean);
};

export type Action<T = Any> = (
  val: T,
  pathNode: PathNode,
  queries: Record<string, Query>
) => boolean;

const ERR_MISSING_FIELD =
  "You must include the array field for '.$' as part of the query document.";

/**
 * Walks the expression and apply the given action for each key-value pair.
 *
 * @param expr The expression for the update operator.
 * @param arrayFilter Filter conditions passed to the operator.
 * @param options The options provided by the caller.
 * @param callback The action to apply for a given path and value.
 * @returns {Any[]<string>}
 */
export function walkExpression<T>(
  expr: AnyObject,
  arrayFilter: AnyObject[],
  options: UpdateOptions,
  callback: Action<T>
): string[] {
  const args: [Any, PathNode, Record<string, Query>?][] = [];
  arrayFilter ||= [];
  const filterIndexMap = Object.fromEntries(
    arrayFilter.map((o, i) => [Object.entries(o).pop()[0].split(".")[0], i])
  );
  const opts = ComputeOptions.init(options.queryOptions);
  const queryKeys = opts.local.condition && Object.keys(opts.local.condition);

  for (const [selector, val] of Object.entries(expr)) {
    const [node, identifiers] = tokenizePath(selector);
    const queries: Record<string, Query> = {};
    if (identifiers.length) {
      // extract filters for each identifier
      const filters: Record<string, AnyObject> = {};
      identifiers.forEach(v => {
        filters[v] = arrayFilter[filterIndexMap[v]];
      });
      // create query for each filter
      for (const [k, condition] of Object.entries(filters)) {
        queries[k] = new QueryImpl(condition, opts);
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
      queries[field] = new QueryImpl({ [k]: opts.local.condition[k] }, opts);
    }

    // save arguments for evaluation
    args.push([val, node, queries]);
  }
  const modified: string[] = [];
  args.forEach(
    ([val, node, queries]) =>
      callback(val as T, node, queries) && modified.push(node.selector)
  );

  return modified;
}
