// Miscellaneous Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#miscellaneous-operators

import { computeValue } from "../../../core/_internal";
import { AnyObject, ExpressionOperator, Options } from "../../../types";

/**
 * Randomly select documents at a given rate.
 *
 * @param {*} obj The target object for this expression
 * @param {*} expr The right-hand side of the operator
 * @param {Options} options Options to use for operation
 */
export const $sampleRate: ExpressionOperator = (
  obj: AnyObject,
  expr: number,
  options: Options
): boolean =>
  Math.random() <= (computeValue(obj, expr, null, options) as number);
