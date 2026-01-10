import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { flatten, isArray, isNil } from "../../../util";
import { $last as __last } from "../../accumulator/last";
import { errInvalidArgs } from "../_internal";

/**
 * Returns the last element in an array.
 */
export const $last: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  if (isArray(obj)) return __last(obj, expr, options);
  const arr = computeValue(obj, expr, null, options) as Any[];
  if (isNil(arr)) return null;
  if (!isArray(arr) || arr.length < 1) {
    return errInvalidArgs(
      options.failOnError,
      "$last must resolve to a non-empty array."
    );
  }
  return flatten(arr)[arr.length - 1];
};
