import { evalExpr } from "../../../core/_internal";
import { Lazy } from "../../../lazy";
import { Any, AnyObject, Options, SortSpec } from "../../../types";
import { assert, compare, isArray, isNil, isObject } from "../../../util";
import { $sort } from "../../pipeline/sort";
import { errExpectArray } from "../_internal";

interface InputExpr {
  input: Any[];
  sortBy: SortSpec | number;
}

/**
 * Sorts an array based on its elements. The sort order is user specified.
 */
export const $sortArray = (
  obj: AnyObject,
  expr: InputExpr,
  options: Options
) => {
  assert(
    isObject(expr) && "input" in expr && "sortBy" in expr,
    "$sortArray expects object { input, sortBy }"
  );
  const { input, sortBy } = evalExpr(obj, expr, options) as InputExpr;

  if (isNil(input)) return null;
  if (!isArray(input))
    return errExpectArray(options.failOnError, "$sortArray 'input'");

  if (isObject(sortBy)) {
    return $sort(Lazy(input), sortBy as SortSpec, options).collect();
  }

  const result = input.slice().sort(compare);
  if (sortBy === -1) result.reverse();
  return result;
};
