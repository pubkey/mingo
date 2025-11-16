import { Any, AnyObject, Options, ProjectionOperator } from "../../types";
import { isArray, resolve } from "../../util";
import { $slice as __slice } from "../expression/array/slice";

/**
 * Limits the number of elements projected from an array. Supports skip and limit slices.
 *
 * @param obj
 * @param field
 * @param expr
 */
export const $slice: ProjectionOperator = (
  obj: AnyObject,
  expr: Any,
  field: string,
  options: Options
): Any => {
  const xs = resolve(obj, field);
  const exprAsArray = expr as Any[];

  if (!isArray(xs)) return xs;

  return __slice(
    obj,
    isArray(expr) ? [xs, ...exprAsArray] : [xs, expr],
    options
  );
};
