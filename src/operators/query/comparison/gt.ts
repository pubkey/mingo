import { Any, Options } from "../../../types";
import { $gt as __gt, processQuery } from "../../_predicates";

/**
 * Matches values that are greater than a specified value.
 */
export const $gt = (selector: string, value: Any, options: Options) =>
  processQuery(selector, value, options, __gt);
