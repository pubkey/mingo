import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isArray, isNil, isNumber } from "../../../util";
import { errExpectArray, errExpectNumber, errInvalidArgs } from "../_internal";

/**
 * Returns a subset of an array.
 *
 * @param  {AnyObject} obj
 * @param  {*} expr
 * @return {*}
 */
export const $slice: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  assert(isArray(expr) && expr.length > 1, "$slice expects array(3)");
  const foe = options.failOnError;

  const args = computeValue(obj, expr, null, options) as Any[];
  const arr = args[0] as Any[];
  let skip = args[1] as number;
  let limit = args[2] as number;

  // MongoDB $slice works a bit differently from Array.slice()
  // Uses [<array>, <limit>] or [ <array>, <skip>, <limit>]
  if (!isArray(arr)) return errExpectArray(foe, "$slice first argument");
  if (!isNumber(skip)) return errExpectNumber(foe, "$slice second argument");

  if (isNil(limit)) {
    if (skip < 0) {
      skip = Math.max(0, arr.length + skip);
    } else {
      limit = skip;
      skip = 0;
    }
  } else {
    if (skip < 0) {
      skip = Math.max(0, arr.length + skip);
    }
    if (limit < 1) {
      return errInvalidArgs(foe, "$slice <n> must be a positive number");
    }

    limit += skip;
  }

  return arr.slice(skip, limit);
};
