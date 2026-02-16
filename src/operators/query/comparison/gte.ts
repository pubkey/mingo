import { Any, Options } from "../../../types";
import { $gte as __gte, processQuery } from "../../_predicates";

/**
 * 	Matches values that are greater than or equal to a specified value.
 */
export const $gte = (selector: string, value: Any, options: Options) =>
  processQuery(selector, value, options, __gte);
