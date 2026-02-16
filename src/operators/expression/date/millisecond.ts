import { Any, AnyObject, Options } from "../../../types";
import { computeDate } from "./_internal";

/**
 * Returns the milliseconds of a date as a number between 0 and 999.
 */
export const $millisecond = (
  obj: AnyObject,
  expr: Any,
  options: Options
): number => computeDate(obj, expr, options).getUTCMilliseconds();
