import { Any, Options } from "../../types";
import { unique } from "../../util";
import { $push } from "./push";

/**
 * Returns an array of all the unique values for the selected field among for each document in that group.
 */
export const $addToSet = (coll: Any[], expr: Any, options: Options) =>
  unique($push(coll, expr, options));
