import { AccumulatorOperator, Any, AnyObject, Options } from "../../types";
import { compare, isNil } from "../../util";
import { $push } from "./push";

/**
 * Returns the minimum value.
 *
 * @param collection The input array
 * @param expr The right-hand side expression value of the operator
 * @param options to use for this operator
 */
export const $min: AccumulatorOperator = (
  collection: AnyObject[],
  expr: Any,
  options: Options
): Any => {
  const items = $push(collection, expr, options).filter(v => !isNil(v));
  if (!items.length) return null;
  return items.reduce((r, v) => (compare(r, v) <= 0 ? r : v));
};
