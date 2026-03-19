import { evalExpr } from "../../../core/_internal";
import { Lazy } from "../../../lazy";
import { assert, compare, isArray, isNil, isObject } from "../../../util";
import { $sort } from "../../pipeline/sort";
import { errExpectArray } from "../_internal";
const $sortArray = (obj, expr, options) => {
  assert(
    isObject(expr) && "input" in expr && "sortBy" in expr,
    "$sortArray expects object { input, sortBy }"
  );
  const { input, sortBy } = evalExpr(obj, expr, options);
  if (isNil(input)) return null;
  if (!isArray(input))
    return errExpectArray(options.failOnError, "$sortArray 'input'");
  if (isObject(sortBy)) {
    return $sort(Lazy(input), sortBy, options).collect();
  }
  const result = input.slice().sort(compare);
  if (sortBy === -1) result.reverse();
  return result;
};
export {
  $sortArray
};
