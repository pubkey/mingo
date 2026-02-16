import { Any, AnyObject, Options } from "../../types";

/**
 * Returns the number of documents in the group or window.
 */
export const $count = (coll: AnyObject[], _expr: Any, _opts: Options) =>
  coll.length;
