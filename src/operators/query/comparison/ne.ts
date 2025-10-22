import { Options, QueryOperator } from "../../../core/_internal";
import { Any } from "../../../types";
import { $ne as __ne, processQuery } from "../../_predicates";

/**
 * Matches all values that are not equal to the value specified in the query.
 */
export const $ne: QueryOperator = (
  selector: string,
  value: Any,
  options: Options
) => processQuery(selector, value, options, __ne);
