import { CloneMode, ComputeOptions, Context, UpdateOptions } from "../../core";
import * as booleanOperators from "../../operators/expression/boolean";
import * as comparisonOperators from "../../operators/expression/comparison";
import * as queryOperators from "../../operators/query";
import { Query } from "../../query";
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
  parent: string;
  child?: string; // special chars: ('*' -> '$[]'), ('?' -> '$')
  next?: PathNode;
};

/**
 * Tokenize a selector path to extract parts for the root, arrayFilter, and child
 */
export function tokenizePath(selector: string): [PathNode, string[]] {
  // no positional operator found
  if (!selector.includes("$")) {
    return [{ parent: selector }, []];
  }

  const nodes: PathNode[] = [];
  const idents: string[] = [];
  let i = 0;

  for (const field of selector.split(".")) {
    // setup current node
    if (i === nodes.length) {
      nodes.push({ parent: undefined });
      // point to new node
      if (i > 0) nodes[i - 1].next = nodes[i];
    }
    // build path with selectors
    if (field[0] !== "$") {
      if (!nodes[i].parent) nodes[i].parent = field;
      else nodes[i].parent += "." + field;
    } else if (field === "$") {
      // positional first
      nodes[i++].child = "?";
    } else if (field === "$[]") {
      // positional array-wide
      nodes[i++].child = "*";
    } else if (field.startsWith("$[") && field.endsWith("]")) {
      // filtered positional
      const child = field.slice(2, -1);
      assert(
        /^[a-z]+[a-zA-Z0-9]*$/.test(child),
        "The filter <identifier> must begin with a lowercase letter and contain only alphanumeric characters."
      );
      idents.push(child);
      nodes[i++].child = child;
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
  q: Record<string, Query>,
  f: Callback<boolean>,
  opts?: WalkOptions
): boolean => {
  const { parent, child: c, next } = n;
  if (!c) {
    // wrapper to collect status
    let b = false;
    const g: Callback<void> = (u, k) => (b = Boolean(f(u, k)) || b);
    walk(o, parent, g, opts);
    return b;
  }
  const t = resolve(o, parent) as Any[];
  // do nothing if we don't get correct type.
  if (!isArray(t)) return false;

  if (c === "$") {
    // TODO: assert that the parent selector is specified in the conditions.
    assert(
      true,
      "You must include the array field as part of the query document."
    );
  }

  // apply update to matching items.
  return t
    .map((e: AnyObject, i) => {
      // filter if applicable.
      if (c !== "*" && q[c] && !q[c].test({ [c]: e })) return false;
      // apply update.
      return next ? applyUpdate(e as ArrayOrObject, next, q, f, opts) : f(t, i);
    })
    .some(Boolean);
};

export type Action<T = Any> = (
  val: T,
  pathNode: PathNode,
  queries: Record<string, Query>
) => boolean;

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
  for (const [selector, val] of Object.entries(expr)) {
    const [node, identifiers] = tokenizePath(selector);
    const queries: Record<string, Query> = {};
    if (identifiers.length) {
      // extract conditions for each identifier
      const conditions: Record<string, AnyObject> = {};
      identifiers.forEach(v => {
        conditions[v] = arrayFilter[filterIndexMap[v]];
      });
      // create query for each filter
      for (const [k, condition] of Object.entries(conditions)) {
        queries[k] = new Query(condition, options.queryOptions);
      }
    }
    // save arguments for evaluation
    args.push([val, node, queries]);
  }
  const modified: string[] = [];
  args.forEach(
    ([val, node, queries]) =>
      callback(val as T, node, queries) && modified.push(node.parent)
  );

  return modified;
}
