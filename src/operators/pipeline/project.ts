import {
  ComputeOptions,
  computeValue,
  Options,
  OpType,
  PipelineOperator,
  ProjectionOperator,
  QueryOperator
} from "../../core/_internal";
import { Iterator } from "../../lazy";
import { Any, AnyObject, Callback, Predicate } from "../../types";
import {
  assert,
  ensureArray,
  filterMissing,
  has,
  intersection,
  isArray,
  isBoolean,
  isEmpty,
  isNumber,
  isObject,
  isOperator,
  isString,
  merge,
  normalize,
  removeValue,
  resolve,
  resolveGraph,
  setValue,
  unique
} from "../../util/_internal";

/**
 * Reshapes each document in the stream, such as by adding new fields or removing existing fields.
 * For each input document, outputs one document.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/project usage}.
 */
export const $project: PipelineOperator = (
  collection: Iterator,
  expr: AnyObject,
  options: Options
): Iterator => {
  if (isEmpty(expr)) return collection;
  checkExpression(expr, options);
  return collection.map(createHandler(expr, ComputeOptions.init(options)));
};

type Handler = (_: AnyObject) => Any;

/**
 * Creates a precompiled handler for projection operation.
 * @param expr  The projection expression
 * @param options The options
 * @param isRoot Indicates whether the handler is for the root object.
 * @returns
 */
function createHandler(
  expr: AnyObject,
  options: ComputeOptions,
  isRoot: boolean = true
): Handler {
  const idKey = options.idKey;
  const expressionKeys = Object.keys(expr);
  const excludedKeys = new Array<string>();
  const includedKeys = new Array<string>();
  const handlers: Record<string, Handler> = {};
  const positional: Record<string, Callback<void>> = {};

  for (const key of expressionKeys) {
    // get expression associated with key
    const subExpr = expr[key];

    if (isNumber(subExpr) || isBoolean(subExpr)) {
      // positive number or true
      if (subExpr) {
        // get predicate for field if used as a positional projection "<array-selector>.$".
        if (isRoot && key.endsWith(".$")) {
          // ensure there is query condition
          const condition = options?.local?.condition;
          assert(
            condition,
            "positional operator '.$' couldn't find matching element in the array."
          );
          const field = key.slice(0, -2);
          positional[field] = getPositionalFilter(field, condition, options);
          includedKeys.push(field);
        } else {
          includedKeys.push(key);
        }
      } else {
        excludedKeys.push(key);
      }
    } else if (isArray(subExpr)) {
      handlers[key] = (o: AnyObject) =>
        subExpr.map(
          v => computeValue(o, v, null, options.update({ root: o })) ?? null
        );
    } else if (isObject(subExpr)) {
      const subExprKeys = Object.keys(subExpr);
      const operator = subExprKeys.length == 1 ? subExprKeys[0] : "";
      // first try projection operator as used in Query.find() queries
      const projectFn = options.context.getOperator(
        OpType.PROJECTION,
        operator
      ) as ProjectionOperator;
      if (projectFn) {
        // check if this $slice operator is used with $expr instead of Query.find()
        // we assume $slice is used with $expr if any of its arguments are not a number
        const foundSlice = operator === "$slice";
        if (foundSlice && !ensureArray(subExpr[operator]).every(isNumber)) {
          handlers[key] = (o: AnyObject) =>
            computeValue(o, subExpr, key, options.update({ root: o }));
        } else {
          handlers[key] = (o: AnyObject) =>
            projectFn(o, subExpr[operator], key, options.update({ root: o }));
        }
      } else if (isOperator(operator)) {
        // pipeline projection
        handlers[key] = (o: AnyObject) =>
          computeValue(o, subExpr[operator], operator, options);
      } else {
        // repeat for nested expression
        checkExpression(subExpr as AnyObject, options);
        assert(subExprKeys.length > 0, `Invalid empty sub-projection: ${key}`);
        handlers[key] = (o: AnyObject) => {
          // ensure that the root object is passed down.
          if (isRoot) options.update({ root: o });
          const target = resolve(o, key);
          const fn = createHandler(subExpr as AnyObject, options, false);
          if (isArray(target)) return target.map(fn);
          if (isObject(target)) return fn(target as AnyObject);
          const res = fn(o);
          if (has(o, key)) return res;
          // when the key does not exist in the source object, the result is only valid if
          // it is a non-object or non-empty object. an empty object indicates no projected fields.
          return !isObject(res) || Object.keys(res).length ? res : undefined;
        };
      }
    } else {
      handlers[key] =
        isString(subExpr) && subExpr[0] === "$"
          ? (o: AnyObject) => computeValue(o, subExpr, key, options)
          : (_: AnyObject) => subExpr;
    }
  }

  const handlerKeys = Object.keys(handlers);
  // the exclude keys includes.
  const idKeyExcluded = excludedKeys.includes(idKey);

  // implicitly add the 'idKey' only for root object.
  const idKeyImplicit =
    isRoot && !idKeyExcluded && !includedKeys.includes(idKey);

  // ResolveOptions for resolveGraph().
  const opts = {
    preserveMissing: true
  };

  return (o: AnyObject) => {
    const newObj = {};

    for (const k of includedKeys) {
      // get value with object graph
      const pathObj = resolveGraph(o, k, opts) ?? {};
      // add the value at the path
      merge(newObj, pathObj);
      // handle positional projection fields.
      if (has(positional, k)) {
        positional[k](newObj);
      }
    }

    // filter out all missing values preserved to support correct merging
    if (includedKeys.length) filterMissing(newObj);

    for (const k of handlerKeys) {
      const value = handlers[k](o);
      if (value === undefined) {
        removeValue(newObj, k, { descendArray: true });
      } else {
        setValue(newObj, k, value);
      }
    }

    // if the only excluded key is the ID key
    if (excludedKeys.length === 1 && idKeyExcluded) {
      // ..and no keys were found during processing, then we merge in all the keys. the exluded key will be removed below.
      if (Object.keys(newObj).length === 0) Object.assign(newObj, o);
    } else if (excludedKeys.length) {
      // if there are excluded keys (ID key inclusive or not),
      // .. we first ensure every key exists in the object but correctly overriden with the new values.
      Object.assign(newObj, { ...o, ...newObj });
    }

    // remove all excluded keys from newObj
    for (const k of excludedKeys) {
      removeValue(newObj, k, { descendArray: true });
    }

    // if the ID key was not explicitly included or excluded, we always add it to the final result.
    if (idKeyImplicit && has(o, idKey)) {
      newObj[idKey] = resolve(o, idKey);
    }
    return newObj;
  };
}

function checkExpression(expr: AnyObject, options: Options): void {
  let exclusions = false;
  let inclusions = false;
  let positional = 0;
  for (const [k, v] of Object.entries(expr)) {
    assert(!k.startsWith("$"), "Field names may not start with '$'.");
    if (k.endsWith(".$")) {
      assert(
        ++positional < 2,
        "Cannot specify more than one positional projection per query."
      );
    }
    if (k === options?.idKey) continue;
    if (v === 0 || v === false) {
      exclusions = true;
    } else if (v === 1 || v === true) {
      inclusions = true;
    }
    assert(
      !(exclusions && inclusions),
      "Projection cannot have a mix of inclusion and exclusion."
    );
  }
}

const findMatches = (
  o: AnyObject,
  key: string,
  leaf: string,
  pred: Predicate
) => {
  let arr = resolve(o, key) as Any[];
  if (!isArray(arr)) arr = resolve(arr, leaf) as AnyObject[];
  assert(isArray(arr), "must resolve to array");
  const matches: number[] = [];
  // note: each value is passed in as an arry to support $elemMatch operator.
  arr.forEach((e, i) => pred({ [leaf]: [e] }) && matches.push(i));
  return matches;
};

const complement = (p: Predicate) => (e: AnyObject) => !p(e);

const COMPOUND_OPS = { $and: 1, $or: 1, $nor: 1 } as const;

/**
 * Returns a callback that updates an object to select the first matching value.
 *
 * @param field The positional field from the projection expression excluding ".$" suffix.
 * @param condition The query condition expression in which to check for the 'field'.
 * @returns
 */
function getPositionalFilter(
  field: string,
  condition: AnyObject,
  options: ComputeOptions
): Callback<void> {
  // we must handle two cases of nested fields. e.g. "a.b.c" can be.
  //  1. {a:{b:[{c:1},{c:2}...]}}
  //  2. {a:{b:{c:[...]}}}
  // we split the selector into the (parent, leaf) eg. "a.b.c" -> ["a.b", "c"].
  // then we use the 'leaf' as the selector to the compiled predicate for the case of nested objects in array paths.
  // since we always need to send an object to the predicate, for non-objects we wrap in an object with the 'leaf' as the key.
  const stack: [string, Any, string?][] = [...Object.entries(condition)];
  const selectors: Partial<
    Record<"$and" | "$or", [string, Predicate, string][]>
  > = { $and: [], $or: [] };
  for (let i = 0; i < stack.length; i++) {
    const [key, val, op] = stack[i] as [string, Any, string];
    if (key === field || key.startsWith(field + ".")) {
      const [operator, expr] = Object.entries(normalize(val)).pop() as [
        string,
        Any
      ];
      const fn = options.context.getOperator(
        OpType.QUERY,
        operator
      ) as QueryOperator;
      const leaf = key.substring(key.lastIndexOf(".") + 1);
      const pred = fn(leaf, expr, options);
      if (!op || op === "$and") {
        // default for all query criteria
        selectors["$and"].push([key, pred, leaf]);
      } else if (op === "$nor") {
        // handle $nor by inverting predicate for conjunction evaluation.
        selectors["$and"].push([key, complement(pred), leaf]);
      } else if (op === "$or") {
        // must check these as a group to identify all matching indices
        selectors["$or"].push([key, pred, leaf]);
      }
    } else if (isOperator(key)) {
      assert(COMPOUND_OPS[key], `${key} is not allowed in this context`);
      for (const item of val as AnyObject[]) {
        Object.entries(item).forEach(([k, v]) => stack.push([k, v, key]));
      }
    }
  }

  const sep = field.lastIndexOf(".");
  const parent = field.substring(0, sep) || field;
  const leaf = field.substring(sep + 1);

  return (o: AnyObject) => {
    const matches: number[][] = [];
    for (const [key, pred, leaf] of selectors["$and"]) {
      matches.push(findMatches(o, key, leaf, pred));
    }

    if (selectors["$or"].length) {
      const orMatches: number[] = [];
      for (const [key, pred, leaf] of selectors["$or"]) {
        orMatches.push(...findMatches(o, key, leaf, pred));
      }
      matches.push(unique(orMatches, (n: number) => n));
    }

    // matching index has passed all conditions
    const i = intersection(matches).sort()[0];
    let first = (resolve(o, field) as Any[])[i];
    if (parent != leaf && !isObject(first)) {
      first = { [leaf]: first };
    }
    setValue(o, parent, [first]);
  };
}
