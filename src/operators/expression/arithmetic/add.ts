import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isDate, isNil } from "../../../util";
import { errInvalidArgs } from "../_internal";

const err = "$add expression must resolve to array of numbers.";

/**
 * Computes the sum of an array of numbers.
 */
export const $add: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number | Date => {
  const args = computeValue(obj, expr, null, options) as number[];
  const failOnError = options.failOnError;
  let dateFound = false;
  let result = 0;

  if (!isArray(args)) return errInvalidArgs(failOnError, err);

  for (const n of args) {
    if (isNil(n)) return null;
    if (typeof n === "number") {
      result += n;
    } else if (isDate(n)) {
      if (dateFound) {
        return errInvalidArgs(failOnError, "$add must only have one date");
      }
      dateFound = true;
      result += +n;
    } else {
      return errInvalidArgs(failOnError, err);
    }
  }
  return dateFound ? new Date(result) : result;
};
