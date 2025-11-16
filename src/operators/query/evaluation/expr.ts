import { computeValue } from "../../../core/_internal";
import { Any, Callback, Options } from "../../../types";
import { truthy } from "../../../util/_internal";

/**
 * Allows the use of aggregation expressions within the query language.
 */
export function $expr(
  _: string,
  expr: Any,
  options: Options
): Callback<boolean> {
  return obj =>
    truthy(computeValue(obj, expr, null, options), options.useStrictMode);
}
