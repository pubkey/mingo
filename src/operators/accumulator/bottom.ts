import { Any, AnyObject, Options } from "../../types";
import { $bottomN } from "./bottomN";

/**
 * Returns the bottom element within a group according to the specified sort order.
 */
export const $bottom = (coll: Any[], expr: Any, options: Options) => {
  return $bottomN(coll, { ...(expr as AnyObject), n: 1 }, options);
};
