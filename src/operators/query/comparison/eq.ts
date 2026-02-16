import { Any, Options } from "../../../types";
import { $eq as __eq, processQuery } from "../../_predicates";

/**
 * Matches values that are equal to a specified value.
 */
export const $eq = (selector: string, value: Any, options: Options) =>
  processQuery(selector, value, options, __eq);
