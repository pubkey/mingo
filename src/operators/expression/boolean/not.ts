import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, ensureArray } from "../../../util";

/**
 * Returns the boolean value that is the opposite of its argument expression. Accepts a single argument expression.
 *
 * @param obj RawObject from collection
 * @param expr Right hand side expression of operator
 * @returns {boolean}
 */
export const $not: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const booleanExpr = ensureArray(expr);
  // array values are truthy so an emty array is false
  if (booleanExpr.length == 0) return false;
  assert(booleanExpr.length == 1, "Expression $not takes exactly 1 argument");
  // use provided value non-array value
  return !computeValue(obj, booleanExpr[0], null, options);
};
