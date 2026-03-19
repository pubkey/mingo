import { evalExpr } from "../../../core/_internal";
import { assert } from "../../../util";
const $function = (obj, expr, options) => {
  assert(
    options.scriptEnabled,
    "$function requires 'scriptEnabled' option to be true"
  );
  const fn = evalExpr(obj, expr, options);
  return fn.body.apply(null, fn.args);
};
export {
  $function
};
