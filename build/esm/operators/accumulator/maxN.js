import { evalExpr } from "../../core/_internal";
import { compare, isInteger, isNil } from "../../util";
import { errExpectNumber, INT_OPTS } from "../expression/_internal";
import { $push } from "./push";
const $maxN = (coll, expr, options) => {
  const copts = options;
  const m = coll.length;
  const n = evalExpr(copts?.local?.groupId, expr.n, copts);
  if (!isInteger(n) || n < 1) {
    return errExpectNumber(options.failOnError, "$maxN 'n'", INT_OPTS.pos);
  }
  const arr = $push(coll, expr.input, options).filter((o) => !isNil(o));
  arr.sort((a, b) => -1 * compare(a, b));
  return m <= n ? arr : arr.slice(0, n);
};
export {
  $maxN
};
