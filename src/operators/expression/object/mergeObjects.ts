import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { $mergeObjects as __mergeObjects } from "../../accumulator/mergeObjects";

/**
 * Combines multiple documents into a single document.
 *
 * @param {*} obj The target object for this expression
 * @param {*} expr The right-hand side of the operator
 * @param {Options} options Options to use for operation
 */
export const $mergeObjects: ExpressionOperator<AnyObject> = (
  obj: AnyObject,
  expr: Any,
  options: Options
): AnyObject => {
  const docs = (computeValue(obj, expr, null, options) ?? []) as AnyObject[];
  return __mergeObjects(docs, expr, options);
};
