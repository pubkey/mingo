import { Any, Options, QueryOperator } from "../../../types";
import { $nin as __nin, processQuery } from "../../_predicates";

/**
 * Matches values that do not exist in an array specified to the query.
 */
export const $nin: QueryOperator = (
  selector: string,
  value: Any,
  options: Options
) => processQuery(selector, value, options, __nin);
