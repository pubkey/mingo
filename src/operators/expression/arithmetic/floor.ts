// Arithmetic Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#arithmetic-expression-operators

import { computeValue, Options } from "../../../core";
import { AnyVal, RawObject } from "../../../types";
import { assert, isNil, isNumber } from "../../../util";

/**
 * Returns the largest integer less than or equal to the specified number.
 *
 * @param obj
 * @param expr
 * @returns {number}
 */
export function $floor(
  obj: RawObject,
  expr: AnyVal,
  options: Options
): number | null {
  const n = computeValue(obj, expr, null, options) as number;
  if (isNil(n)) return null;
  assert(
    isNumber(n) || isNaN(n),
    "$floor expression must resolve to a number."
  );
  return Math.floor(n);
}
