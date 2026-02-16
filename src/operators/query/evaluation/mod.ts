import { Any, Options } from "../../../types";
import { $mod as __mod, processQuery, QueryPredicate } from "../../_predicates";

/**
 * Performs a modulo operation on the value of a field and selects documents with a specified result.
 */
export const $mod = (selector: string, value: Any, options: Options) =>
  processQuery(selector, value, options, __mod as QueryPredicate);
