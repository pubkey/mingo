import { Options, QueryOperator } from "../../../core/_internal";
import { Any } from "../../../types";
import { $lte as __lte, processQuery } from "../../_predicates";

/**
 * Matches values that are less than or equal to the value specified in the query.
 */
export const $lte: QueryOperator = (
  selector: string,
  value: Any,
  options: Options
) => processQuery(selector, value, options, __lte);
