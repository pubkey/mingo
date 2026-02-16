import { Any, AnyObject, Options } from "../../../types";
import { computeDate } from "./_internal";

/**
 * Returns the hour for a date as a number between 0 and 23.
 */
export const $hour = (obj: AnyObject, expr: Any, options: Options): number =>
  computeDate(obj, expr, options).getUTCHours();
