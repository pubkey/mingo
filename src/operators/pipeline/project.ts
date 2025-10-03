import {
  ComputeOptions,
  computeValue,
  getOperator,
  Options,
  OpType,
  PipelineOperator,
  ProjectionOperator
} from "../../core";
import { Iterator } from "../../lazy";
import { Any, AnyObject } from "../../types";
import {
  assert,
  ensureArray,
  filterMissing,
  has,
  isArray,
  isBoolean,
  isEmpty,
  isNumber,
  isObject,
  isOperator,
  isString,
  merge,
  removeValue,
  resolve,
  resolveGraph,
  setValue
} from "../../util";

/**
 * Reshapes each document in the stream, such as by adding new fields or removing existing fields.
 * For each input document, outputs one document.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/project usage}.
 *
 * @param collection
 * @param expr
 * @param opt
 * @returns
 */
export const $project: PipelineOperator = (
  collection: Iterator,
  expr: AnyObject,
  options: Options
): Iterator => {
  if (isEmpty(expr)) return collection;
  validateExpression(expr, options);
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

  for (const key of expressionKeys) {
    // get expression associated with key
    const subExpr = expr[key];

    if (isNumber(subExpr) || isBoolean(subExpr)) {
      // positive number or true
      if (subExpr) {
        includedKeys.push(key);
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
      const projectFn = getOperator(
        OpType.PROJECTION,
        operator,
        options
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
        validateExpression(subExpr as AnyObject, options);
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

function validateExpression(expr: AnyObject, options: Options): void {
  let exclusions = false;
  let inclusions = false;
  for (const [k, v] of Object.entries(expr)) {
    assert(!k.startsWith("$"), "Field names may not start with '$'.");
    assert(
      !k.endsWith(".$"),
      "Positional projection operator '$' is not supported."
    );
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
