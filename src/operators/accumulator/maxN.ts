import { ComputeOptions, evalExpr } from "../../core/_internal";
import { Any, AnyObject, Options } from "../../types";
import { compare, isInteger, isNil } from "../../util";
import { errExpectNumber, INT_OPTS } from "../expression/_internal";
import { $push } from "./push";

interface InputExpr {
  n: Any;
  input: Any;
}

/**
 * Returns an aggregation of the maxmimum value n elements within a group.
 */
export const $maxN = (coll: AnyObject[], expr: InputExpr, options: Options) => {
  const copts = options as ComputeOptions;
  const m = coll.length;
  const n = evalExpr(copts?.local?.groupId, expr.n, copts) as number;
  if (!isInteger(n) || n < 1) {
    return errExpectNumber(options.failOnError, "$maxN 'n'", INT_OPTS.pos);
  }
  const arr = $push(coll, expr.input, options).filter(o => !isNil(o));
  arr.sort((a, b) => -1 * compare(a, b));
  return m <= n ? arr : arr.slice(0, n);
};
