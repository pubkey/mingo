import { Any, AnyObject, Options, WindowOperator } from "../../types";
import { rank, WindowOperatorInput } from "./_internal";

/** Returns the position of a document in the $setWindowFields stage partition. */
export const $rank: WindowOperator = (
  obj: AnyObject,
  collection: AnyObject[],
  expr: WindowOperatorInput,
  options: Options
): Any => rank(obj, collection, expr, options, false /*dense*/);
