import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { flatten, isArray, isNil } from "../../../util";
import { $last as __last } from "../../accumulator/last";
import { errExpectArray } from "../_internal";

/**
 * Returns the last element in an array.
 */
export const $last: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  if (isArray(obj)) return __last(obj, expr, options);
  const arr = evalExpr(obj, expr, options) as Any[];
  if (isNil(arr)) return null;
  if (!isArray(arr) || arr.length === 0) {
    return errExpectArray(options.failOnError, "$last", { size: 0 });
  }
  return flatten(arr)[arr.length - 1];
};
