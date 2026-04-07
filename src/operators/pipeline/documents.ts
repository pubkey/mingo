import { evalExpr } from "../../core/_internal";
import { Iterator, Lazy } from "../../lazy";
import { Any, Options } from "../../types";
import { assert, cloneDeep, isArray } from "../../util";

/**
 * Returns literal documents from input values.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/documents/ usage}.
 */
export function $documents(_: Iterator, expr: Any, options: Options): Iterator {
  const docs = evalExpr(null, expr, options);
  assert(isArray(docs), "$documents expression must resolve to an array.");
  return Lazy(docs as Any[]).map(o => cloneDeep(o));
}
