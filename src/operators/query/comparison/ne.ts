import { Any, Options, QueryOperator } from "../../../types";
import { $ne as __ne, processQuery } from "../../_predicates";

/**
 * Matches all values that are not equal to the value specified in the query.
 */
export const $ne: QueryOperator = (
  selector: string,
  value: Any,
  options: Options
) => processQuery(selector, value, options, __ne);
