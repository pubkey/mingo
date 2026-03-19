import { evalExpr } from "../../../core/_internal";
import { assert, isArray, isNil, isString } from "../../../util";
import { errExpectArray } from "../_internal";
const $split = (obj, expr, options) => {
  assert(isArray(expr) && expr.length === 2, `$split expects array(2)`);
  const args = evalExpr(obj, expr, options);
  const foe = options.failOnError;
  if (isNil(args[0])) return null;
  if (!args.every(isString))
    return errExpectArray(foe, `$split `, { size: 2, type: "string" });
  return args[0].split(args[1]);
};
export {
  $split
};
