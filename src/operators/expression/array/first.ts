import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { flatten, isArray, isNil } from "../../../util";
import { $first as __first } from "../../accumulator/first";
import { errExpectArray } from "../_internal";

/**
 * Returns the first element in an array.
 */
export const $first: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  if (isArray(obj)) return __first(obj, expr, options);
  const arr = evalExpr(obj, expr, options) as Any[];
  if (isNil(arr)) return null;
  if (!isArray(arr)) {
    return errExpectArray(options.failOnError, "$first");
  }
  return flatten(arr)[0];
};
