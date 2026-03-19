import { evalExpr } from "../../../core/_internal";
import { isArray, isNil, isString } from "../../../util";
import { assert, simpleCmp } from "../../../util/_internal";
import { errExpectArray } from "../_internal";
const $strcasecmp = (obj, expr, options) => {
  assert(isArray(expr) && expr.length === 2, `$strcasecmp expects array(2)`);
  const args = evalExpr(obj, expr, options);
  const foe = options.failOnError;
  if (args.every(isNil)) return 0;
  if (!args.every(isString))
    return errExpectArray(foe, `$strcasecmp arguments`, { type: "string" });
  const [a, b] = args.map((s) => s.toLowerCase());
  return simpleCmp(a, b);
};
export {
  $strcasecmp
};
