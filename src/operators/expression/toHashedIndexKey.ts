import { computeValue } from "../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../types";
import { hashCode } from "../../util";

/**
 * Computes and returns the hash value of the input expression. A hash function maps a key or string to a fixed-size numeric value.
 * The user-defined hash function is used when provided, otherwise the internal default is used.
 *
 * See {@link https://docs.mongodb.com/manual/reference/operator/aggregation/toHashedIndexKey/}
 */
export const $toHashedIndexKey: ExpressionOperator<number> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number =>
  hashCode(computeValue(obj, expr, null, options), options.hashFunction);
