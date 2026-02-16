import { AnyObject, Options } from "../../../types";
import { assert, isArray } from "../../../util";
import { $or } from "./or";

/**
 * Joins query clauses with a logical NOR returns all documents that fail to match both clauses.
 */
export function $nor(_: string, rhs: AnyObject[], options: Options) {
  assert(
    isArray(rhs),
    "Invalid expression. $nor expects value to be an array."
  );
  const f = $or("$or", rhs, options);
  return (obj: AnyObject) => !f(obj);
}
