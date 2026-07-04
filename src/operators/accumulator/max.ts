import { Any, AnyObject, Options } from "../../types";
import { compare, isNil } from "../../util";
import { $push } from "./push";

/**
 * Returns the maximum value
 */
export const $max = (coll: AnyObject[], expr: Any, options: Options) => {
  const items = $push(coll, expr, options).slice().sort(compare);
  const size = items.length;
  return isNil(items[size - 1]) ? null : items[size - 1];
};
