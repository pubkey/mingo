import { Any, AnyObject, Options } from "../../types";
import { compare, isNil } from "../../util";
import { $push } from "./push";

/**
 * Returns the maximum value
 */
export const $max = (coll: AnyObject[], expr: Any, options: Options) => {
  const items = $push(coll, expr, options).filter(v => !isNil(v));
  if (!items.length) return null;
  return items.reduce((r, v) => (compare(r, v) >= 0 ? r : v));
};
