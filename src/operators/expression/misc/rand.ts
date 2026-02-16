import { Any, AnyObject, Options } from "../../../types";

/**
 * Returns a random float between 0 and 1.
 */
export const $rand = (_obj: AnyObject, _expr: Any, _options: Options): number =>
  Math.random();
