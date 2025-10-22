import { Options, QueryOperator } from "../../../core/_internal";
import { QueryImpl } from "../../../query/_internal";
import { Any, AnyObject, Callback } from "../../../types";
import { normalize } from "../../../util";

/**
 * Inverts the effect of a query expression and returns documents that do not match the query expression.
 *
 * @param selector
 * @param rhs
 * @returns {Function}
 */
export const $not: QueryOperator = (
  selector: string,
  rhs: Any,
  options: Options
): Callback<boolean> => {
  const criteria = {};
  criteria[selector] = normalize(rhs);
  const query = new QueryImpl(criteria, options);
  return (obj: AnyObject) => !query.test(obj);
};
