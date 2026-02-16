import { Any, AnyObject, Options } from "../../types";
import { rank, WindowOperatorInput } from "./_internal";

/** Returns the document position relative to other documents in the $setWindowFields stage partition. */
export const $denseRank = (
  obj: AnyObject,
  coll: AnyObject[],
  expr: WindowOperatorInput,
  options: Options
): Any => rank(obj, coll, expr, options, true /*dense*/);
