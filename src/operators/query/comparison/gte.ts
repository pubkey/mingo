import { Options, QueryOperator } from "../../../core/_internal";
import { Any } from "../../../types";
import { $gte as __gte, processQuery } from "../../_predicates";

/**
 * 	Matches values that are greater than or equal to a specified value.
 */
export const $gte: QueryOperator = (
  selector: string,
  value: Any,
  options: Options
) => processQuery(selector, value, options, __gte);
