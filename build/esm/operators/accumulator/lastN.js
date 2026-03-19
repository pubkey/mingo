import { evalExpr } from "../../core/_internal";
import { isInteger } from "../../util";
import { errExpectNumber, INT_OPTS } from "../expression/_internal";
import { $push } from "./push";
const $lastN = (coll, expr, options) => {
  const copts = options;
  const m = coll.length;
  const n = evalExpr(copts?.local?.groupId, expr.n, copts);
  const foe = options.failOnError;
  if (!isInteger(n) || n < 1) {
    return errExpectNumber(foe, "$lastN 'n'", INT_OPTS.pos);
  }
  return $push(m <= n ? coll : coll.slice(m - n), expr.input, options);
};
export {
  $lastN
};
