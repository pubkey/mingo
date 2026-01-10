import { AnyObject, ExpressionOperator, Options } from "../../../types";
import { processBitwise } from "./_internal";

/**
 * Returns the result of a bitwise and operation on an array of int or long values.
 *
 * @param obj RawObject from collection
 * @param expr Right hand side expression of operator
 * @returns {Number}
 */
export const $bitAnd: ExpressionOperator = (
  obj: AnyObject,
  expr: AnyObject,
  options: Options
) =>
  processBitwise(obj, expr, options, "$bitAnd", nums =>
    nums.reduce((a, b) => a & b, -1)
  );
