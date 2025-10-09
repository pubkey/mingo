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

const FILTER_IDENT_RE = /^[a-z]+[a-zA-Z0-9]*$/;

export type PathNode = {
  selector: string;
  parent: string;
  child?: string;
  next?: PathNode;
};

/**
 * Tokenize a selector path to extract parts for the root, arrayFilter, and child
 * @param selector The path to tokenize
 * @returns {parent:string, elem:string, child:string}
 */
export function tokenizePath(selector: string): [PathNode, string[]] {
  if (!selector.includes(".$")) {
    return [{ parent: selector, selector }, []];
  }
  const begin = selector.indexOf(".$");
  const end = selector.indexOf("]");
  const parent = selector.substring(0, begin);
  // using "$" wildcard to represent every element.
  const child = selector.substring(begin + 3, end);
  assert(
    child === "" || FILTER_IDENT_RE.test(child),
    "The filter <identifier> must begin with a lowercase letter and contain only alphanumeric characters."
  );
  const rest = selector.substring(end + 2);
  const [next, elems] = rest ? tokenizePath(rest) : [];
  return [
    { selector, parent, child: child || "$", next },
    [child, ...(elems || [])].filter(Boolean)
  ];
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
  // apply update to matching items.
  return t
    .map((e: AnyObject, i) => {
      // filter if applicable.
      if (q[c] && !q[c].test({ [c]: e })) return false;
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
  const res: string[] = [];
  for (const [selector, val] of Object.entries(expr)) {
    const [node, vars] = tokenizePath(selector);
    if (!vars.length) {
      if (callback(val as T, node, {})) res.push(node.parent);
    } else {
      // extract conditions for each identifier
      const conditions: Record<string, AnyObject> = {};
      arrayFilter.forEach(o => {
        Object.keys(o).forEach(k => {
          vars.forEach(w => {
            if (k === w || k.startsWith(w + ".")) {
              conditions[w] = conditions[w] || {};
              Object.assign(conditions[w], { [k]: o[k] });
            }
          });
        });
      });
      // create queries for each identifier
      const queries: Record<string, Query> = {};
      for (const [k, condition] of Object.entries(conditions)) {
        queries[k] = new Query(condition, options.queryOptions);
      }

      if (callback(val as T, node, queries)) res.push(node.parent);
    }
  }
  return res;
}
