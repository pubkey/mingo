import { Any, Options } from "../../../types";
import {
  $elemMatch as __elemMatch,
  processQuery,
  QueryPredicate
} from "../../_predicates";

/**
 * Selects documents if element in the array field matches all the specified $elemMatch conditions.
 */
export const $elemMatch = (selector: string, value: Any, options: Options) =>
  processQuery(selector, value, options, __elemMatch as QueryPredicate);
