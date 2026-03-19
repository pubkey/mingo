import { assert, isFunction, truthy } from "../../../util/_internal";
function $where(_, rhs, opts) {
  assert(
    opts.scriptEnabled,
    "$where requires 'scriptEnabled' option to be true"
  );
  const f = rhs;
  assert(isFunction(f), "$where only accepts a Function objects");
  return (obj) => truthy(f.call(obj), opts?.useStrictMode);
}
export {
  $where
};
