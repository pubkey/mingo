import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { processBitwise } from "./_internal";

/**
 * Returns the result of a bitwise xor (exclusive or) operation on an array of int and long values.
 */
export const $bitXor: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
) =>
  processBitwise(obj, expr, options, "$bitXor", nums =>
    nums.reduce((a, b) => a ^ b, 0)
  );
