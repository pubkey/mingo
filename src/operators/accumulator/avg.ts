import { Any, Options } from "../../types";
import { isNumber } from "../../util";
import { $push } from "./push";

/**
 * Returns an average of all the values in a group.
 */
export const $avg = (coll: Any[], expr: Any, options: Options) => {
  const data = $push(coll, expr, options).filter(isNumber);
  if (data.length === 0) return null;
  const sum = data.reduce<number>((acc: number, n: number) => acc + n, 0);
  return sum / data.length;
};
