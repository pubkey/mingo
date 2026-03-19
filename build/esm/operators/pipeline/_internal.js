import { Lazy } from "../../lazy";
import { isNumber, isObject } from "../../util";
import { assert, isArray, isString, PathValidator } from "../../util/_internal";
import { $documents } from "./documents";
const EMPTY = Lazy([]);
function filterDocumentsStage(pipeline, options) {
  if (!pipeline) return {};
  const docs = pipeline[0]?.$documents;
  if (!docs) return { pipeline };
  return {
    documents: $documents(EMPTY, docs, options).collect(),
    pipeline: pipeline.slice(1)
  };
}
function validateProjection(expr, options, isRoot = true) {
  const res = {
    exclusions: [],
    inclusions: [],
    positional: 0
  };
  const keys = Object.keys(expr);
  assert(keys.length, "Invalid empty sub-projection");
  const idKey = options?.idKey;
  let idKeyExcluded = false;
  for (const k of keys) {
    if (k.startsWith("$")) {
      assert(
        !isRoot && keys.length === 1,
        `FieldPath field names may not start with '$', given '${k}'.`
      );
      return res;
    }
    if (k.endsWith(".$")) res.positional++;
    const v = expr[k];
    if (v === false || isNumber(v) && v === 0) {
      if (k === idKey) {
        idKeyExcluded = true;
      } else res.exclusions.push(k);
    } else if (!isObject(v)) {
      res.inclusions.push(k);
    } else {
      const s = validateProjection(v, options, false);
      if (!s.inclusions.length && !s.exclusions.length) {
        if (!res.inclusions.includes(k)) res.inclusions.push(k);
      } else {
        s.inclusions.forEach((s2) => res.inclusions.push(`${k}.${s2}`));
        s.exclusions.forEach((s2) => res.exclusions.push(`${k}.${s2}`));
      }
      res.positional += s.positional;
    }
    assert(
      !(res.exclusions.length && res.inclusions.length),
      "Cannot do exclusion and inclusion in projection."
    );
    assert(
      res.positional <= 1,
      "Cannot specify more than one positional projection."
    );
  }
  if (idKeyExcluded) {
    res.exclusions.push(idKey);
  }
  if (isRoot) {
    const p = new PathValidator();
    res.exclusions.forEach((k) => assert(p.add(k), `Path collision at ${k}.`));
    res.inclusions.forEach((k) => assert(p.add(k), `Path collision at ${k}.`));
    res.exclusions.sort();
    res.inclusions.sort();
  }
  return res;
}
function resolveCollection(op, expr, options) {
  if (isString(expr)) {
    assert(
      options.collectionResolver,
      `${op} requires 'collectionResolver' option to resolve named collection`
    );
  }
  const coll = isString(expr) ? options.collectionResolver(expr) : expr;
  assert(isArray(coll), `${op} could not resolve input collection`);
  return coll;
}
export {
  filterDocumentsStage,
  resolveCollection,
  validateProjection
};
