import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { processBitwise } from "./_internal";

/**
 * Returns the result of a bitwise xor (exclusive or) operation on an array of int and long values.
 *
 * @param obj RawObject from collection
 * @param expr Right hand side expression of operator
 * @returns {Number}
 */
export const $bitXor: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
) =>
  processBitwise(obj, expr, options, nums => nums.reduce((a, b) => a ^ b, 0));
