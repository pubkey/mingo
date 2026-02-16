import { Iterator } from "../../lazy";
import { Options } from "../../types";
import { ensureArray } from "../../util";
import { $project } from "./project";

/**
 * Removes/excludes fields from documents.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/unset usage}.
 */
export function $unset(
  coll: Iterator,
  expr: string | string[],
  options: Options
): Iterator {
  expr = ensureArray(expr);
  const doc: Record<string, number> = {};
  for (const k of expr) doc[k] = 0;
  return $project(coll, doc, options);
}
