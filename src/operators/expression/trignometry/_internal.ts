import { computeValue, Options } from "../../../core/_internal";
import { Any, AnyObject, Callback } from "../../../types";
import { assert } from "../../../util";

/**
 * Processes a trigonometric operator on a value with special handling for fixed points.
 *
 * @param obj - The object containing the value to process
 * @param expr - The expression to evaluate
 * @param options - Options for computation
 * @param fn - Callback function to apply on the computed value
 * @param fixedPoints - Optional map of fixed point values to handle specially (defaults to FIXED_POINTS)
 * @returns The result of applying the trigonometric operation, or null
 * @throws {AssertionError} When trying to apply operation on invalid fixed points
 */
export function processOperator(
  obj: AnyObject,
  expr: Any,
  options: Options,
  fn: Callback<number | null>,
  fixedPoints?: Record<string, null | number | Error>
): number | null {
  const fp = {
    undefined: null,
    null: null,
    NaN: NaN,
    Infinity: new Error(),
    "-Infinity": new Error(),
    ...fixedPoints
  };
  const n = computeValue(obj, expr, null, options) as number;
  if (n in fp) {
    const res = fp[n] as number | Error;
    const err = res instanceof Error;
    assert(!err, `$${fn.name}: value must be in range (-inf,inf)`);
    return !err && res;
  }
  return fn(n);
}
