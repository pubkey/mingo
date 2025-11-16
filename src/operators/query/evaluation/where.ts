import { Any, Callback, Options, Predicate } from "../../../types";
import { assert, isFunction, truthy } from "../../../util/_internal";

/**
 * Matches documents that satisfy a JavaScript expression.
 */
export function $where(
  _: string,
  rhs: Any,
  options: Options
): Callback<boolean> {
  assert(options.scriptEnabled, "$where: 'scriptEnabled' option must be true");
  const f = rhs as Predicate<Any>;
  assert(isFunction(f), "$where only accepts a Function object");
  return obj => truthy(f.call(obj), options?.useStrictMode);
}
