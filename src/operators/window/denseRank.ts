import { Any, AnyObject, Options, WindowOperator } from "../../types";
import { rank, WindowOperatorInput } from "./_internal";

/** Returns the document position relative to other documents in the $setWindowFields stage partition. */
export const $denseRank: WindowOperator = (
  obj: AnyObject,
  collection: AnyObject[],
  expr: WindowOperatorInput,
  options: Options
): Any => rank(obj, collection, expr, options, true /*dense*/);
