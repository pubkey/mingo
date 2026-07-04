import { Any, AnyObject, Options } from "../../types";
import { compare, isNil } from "../../util";
import { $push } from "./push";

/**
 * Returns the minimum value.
 */
export const $min = (coll: AnyObject[], expr: Any, options: Options) => {
  const items = $push(coll, expr, options)
    .filter(o => !isNil(o))
    .sort(compare);
  return isNil(items[0]) ? null : items[0];
};
