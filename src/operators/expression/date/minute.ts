import { Any, AnyObject, Options } from "../../../types";
import { computeDate } from "./_internal";

/**
 * Returns the minute for a date as a number between 0 and 59.
 */
export const $minute = (obj: AnyObject, expr: Any, options: Options): number =>
  computeDate(obj, expr, options).getUTCMinutes();
