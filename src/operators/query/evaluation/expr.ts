import { computeValue, Options } from "../../../core/_internal";
import { Any, Callback } from "../../../types";
import { truthy } from "../../../util";

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
