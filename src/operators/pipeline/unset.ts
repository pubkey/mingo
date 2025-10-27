import { Options, PipelineOperator } from "../../core/_internal";
import { Iterator } from "../../lazy";
import { ensureArray } from "../../util";
import { $project } from "./project";

/**
 * Removes/excludes fields from documents.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/unset usage}.
 *
 * @param collection
 * @param expr
 * @param options
 * @returns {Iterator}
 */
export const $unset: PipelineOperator = (
  collection: Iterator,
  expr: string | string[],
  options?: Options
): Iterator => {
  expr = ensureArray(expr);
  const doc: Record<string, number> = {};
  for (const k of expr) doc[k] = 0;
  return $project(collection, doc, options);
};
