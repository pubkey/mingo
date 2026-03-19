import { ComputeOptions, evalExpr } from "../core/_internal";
import { Query } from "../query";
import {
  Any,
  AnyObject,
  BsonType,
  Callback,
  JsType,
  Options,
  Predicate
} from "../types";
import {
  assert,
  compare as mingoCmp,
  ensureArray,
  flatten,
  intersection,
  isArray,
  isBoolean,
  isDate,
  isEmpty,
  isEqual,
  isNil,
  isNumber,
  isObject,
  isOperator,
  isPrimitive,
  isRegExp,
  isString,
  resolve,
  truthy,
  typeOf
} from "../util/_internal";

type ConversionType = number | Exclude<JsType, "function"> | BsonType;

export type QueryPredicate = (_a: Any, _b: Any, _o: Options) => boolean;

export function processQuery(
  selector: string,
  value: Any,
  options: Options,
  predicate: QueryPredicate
): (_: AnyObject) => boolean {
  const opts = { unwrapArray: true };
  // pre-split the path once at compilation time
  const pathArray = selector.split(".");
  const depth = Math.max(1, pathArray.length - 1);
  const copts = ComputeOptions.init(options).update({ depth });
  return (o: AnyObject): boolean => {
    // value of field must be fully resolved.
    const lhs = resolve(o, selector, opts, pathArray);
    return predicate(lhs, value, copts);
  };
}

export function processExpression(
  obj: AnyObject,
  expr: Any,
  options: Options,
  predicate: (_a: Any, _b: Any, _o?: Options) => boolean
): boolean {
  assert(
    isArray(expr) && expr.length === 2,
    `${predicate.name} expects array(2)`
  );
  const [lhs, rhs] = evalExpr(obj, expr, options) as Any[];
  return predicate(lhs, rhs, options);
}

/**
 * Checks that two values are equal.
 */
export function $eq(a: Any, b: Any, options?: Options): boolean {
  // start with simple equality check
  if (isEqual(a, b)) return true;

  // https://docs.mongodb.com/manual/tutorial/query-for-null-fields/
  if (isNil(a) && isNil(b)) return true;

  // check
  if (isArray(a)) {
    const depth = (options as ComputeOptions)?.local?.depth ?? 1;
    return (
      a.some(v => isEqual(v, b)) || flatten(a, depth).some(v => isEqual(v, b))
    );
  }

  return false;
}

/**
 * Matches all values that are not equal to the value specified in the query.
 */
export function $ne(a: Any, b: Any, options?: Options): boolean {
  return !$eq(a, b, options);
}

/**
 * Matches any of the values that exist in an array specified in the query.
 */
export function $in(a: Any[], b: Any[], _options?: Options): boolean {
  // queries for null should be able to find undefined fields
  if (isNil(a)) return b.some(v => v === null);

  const lhs = ensureArray(a);

  // fast path: if all values in b are primitives, use a Set for O(1) lookup.
  if (b.every(isPrimitive)) {
    const set = new Set(b);
    return lhs.some(v => set.has(v));
  }

  return intersection([lhs, b]).length > 0;
}

/**
 * Matches values that do not exist in an array specified to the query.
 */
export function $nin(a: Any[], b: Any[], options?: Options): boolean {
  return !$in(a, b, options);
}

/**
 * Matches values that are less than the value specified in the query.
 */
export function $lt(a: Any, b: Any, _options?: Options): boolean {
  return compare(a, b, (x: Any, y: Any) => mingoCmp(x, y) < 0);
}

/**
 * Matches values that are less than or equal to the value specified in the query.
 */
export function $lte(a: Any, b: Any, _options?: Options): boolean {
  return compare(a, b, (x: Any, y: Any) => mingoCmp(x, y) <= 0);
}

/**
 * Matches values that are greater than the value specified in the query.
 */
export function $gt(a: Any, b: Any, _options?: Options): boolean {
  return compare(a, b, (x: Any, y: Any) => mingoCmp(x, y) > 0);
}

/**
 * Matches values that are greater than or equal to the value specified in the query.
 */
export function $gte(a: Any, b: Any, _options?: Options): boolean {
  return compare(a, b, (x: Any, y: Any) => mingoCmp(x, y) >= 0);
}

/**
 * Performs a modulo operation on the value of a field and selects documents with a specified result.
 */
export function $mod(a: Any, b: number[], _options: Options): boolean {
  return ensureArray(a).some(
    ((x: number) => b.length === 2 && x % b[0] === b[1]) as Callback
  );
}

/**
 * Selects documents where values match a specified regular expression.
 */
export function $regex(a: Any, b: RegExp, options?: Options): boolean {
  const lhs = ensureArray(a) as string[];
  const match = (x: string) =>
    isString(x) && truthy(b.exec(x), options?.useStrictMode);
  return lhs.some(match) || flatten(lhs, 1).some(match as Callback);
}

/**
 * Matches arrays that contain all elements specified in the query.
 */
export function $all(
  values: Any[],
  queries: AnyObject[],
  options: Options
): boolean {
  if (
    !isArray(values) ||
    !isArray(queries) ||
    !values.length ||
    !queries.length
  ) {
    return false;
  }

  let matched = true;
  for (const query of queries) {
    // no need to check all the queries.
    if (!matched) break;
    if (isObject(query) && Object.keys(query).includes("$elemMatch")) {
      matched = $elemMatch(values, query["$elemMatch"] as AnyObject, options);
    } else if (isRegExp(query)) {
      matched = values.some(s => typeof s === "string" && query.test(s));
    } else {
      matched = values.some(v => isEqual(query, v));
    }
  }
  return matched;
}

/**
 * Selects documents if the array field is a specified size.
 */
export function $size(a: Any[], b: number, _options?: Options): boolean {
  return Array.isArray(a) && a.length === b;
}

function isNonBooleanOperator(name: string): boolean {
  return isOperator(name) && ["$and", "$or", "$nor"].indexOf(name) === -1;
}

/**
 * Selects documents if element in the array field matches all the specified $elemMatch condition.
 */
export function $elemMatch(a: Any[], b: AnyObject, options: Options): boolean {
  // should return false for non-matching input
  if (isArray(a) && !isEmpty(a)) {
    let format = (x: Any) => x;
    let criteria = b;

    // If we find a boolean operator in the subquery, we fake a field to point to it. This is an
    // attempt to ensure that it is a valid criteria. We cannot make this substitution for operators
    // like $and/$or/$nor; as otherwise, this faking will break our query.
    if (Object.keys(b).every(isNonBooleanOperator)) {
      criteria = { temp: b };
      format = x => ({ temp: x });
    }

    const query = new Query(criteria, options);
    for (let i = 0, len = a.length; i < len; i++) {
      if (query.test(format(a[i]) as AnyObject)) {
        return true;
      }
    }
  }
  return false;
}

// helper functions
const isNull = (a: Any) => a === null;

/** Mapping of type to predicate */
const compareFuncs: Record<ConversionType, Predicate<Any>> = {
  array: isArray,
  boolean: isBoolean,
  bool: isBoolean,
  date: isDate,
  number: isNumber,
  int: isNumber,
  long: isNumber,
  double: isNumber,
  decimal: isNumber,
  null: isNull,
  object: isObject,
  regexp: isRegExp,
  regex: isRegExp,
  string: isString,
  // added for completeness
  undefined: isNil, // deprecated
  // Mongo identifiers
  1: isNumber, //double
  2: isString,
  3: isObject,
  4: isArray as Predicate<Any>,
  6: isNil, // deprecated
  8: isBoolean,
  9: isDate,
  10: isNull,
  11: isRegExp,
  16: isNumber, //int
  18: isNumber, //long
  19: isNumber //decimal
};

/**
 * Selects documents if a field is of the specified type.
 */
function compareType(a: Any, b: ConversionType, _?: Options): boolean {
  const f = compareFuncs[b];
  return f ? f(a) : false;
}

/**
 * Selects documents if a field is of the specified type.
 */
export function $type(
  a: Any,
  b: ConversionType | ConversionType[],
  options?: Options
): boolean {
  return isArray(b)
    ? b.findIndex(t => compareType(a, t, options)) >= 0
    : compareType(a, b, options);
}

function compare(a: Any, b: Any, f: Predicate<Any>): boolean {
  const tb = typeOf(b);
  return ensureArray(a).some(x => typeOf(x) === tb && f(x, b));
}
