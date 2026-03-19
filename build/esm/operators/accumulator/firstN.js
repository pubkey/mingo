import { evalExpr } from "../../core/_internal";
import { isInteger } from "../../util";
import { errExpectNumber, INT_OPTS } from "../expression/_internal";
import { $push } from "./push";
const $firstN = (coll, expr, options) => {
  const foe = options.failOnError;
  const copts = options;
  const m = coll.length;
  const n = evalExpr(copts?.local?.groupId, expr.n, copts);
  if (!isInteger(n) || n < 1)
    return errExpectNumber(foe, "$firstN 'n'", INT_OPTS.pos);
  return $push(m <= n ? coll : coll.slice(0, n), expr.input, options);
};
export {
  $firstN
};
