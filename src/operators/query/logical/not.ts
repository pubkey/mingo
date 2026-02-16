import { Query } from "../../../query";
import { Any, AnyObject, Options } from "../../../types";
import { normalize } from "../../../util";

/**
 * Inverts the effect of a query expression and returns documents that do not match the query expression.
 */
export function $not(selector: string, rhs: Any, options: Options) {
  const criteria: AnyObject = {};
  criteria[selector] = normalize(rhs);
  const query = new Query(criteria, options);
  return (obj: AnyObject) => !query.test(obj);
}
