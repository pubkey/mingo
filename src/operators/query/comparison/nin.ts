import { Any, AnyObject, Options } from "../../../types";
import { $in } from "./in";

/**
 * Matches values that do not exist in an array specified to the query.
 */
export const $nin = (
  selector: string,
  value: Any,
  options: Options
): ((_: AnyObject) => boolean) => {
  const inPredicate = $in(selector, value, options);
  return (o: AnyObject): boolean => !inPredicate(o);
};
