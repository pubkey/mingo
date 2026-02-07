import { ComputeOptions, evalExpr } from "../../core/_internal";
import { AccumulatorOperator, Any, AnyObject, Options } from "../../types";
import { compare, isInteger, isNil } from "../../util";
import { errExpectNumber, INT_OPTS } from "../expression/_internal";
import { $push } from "./push";

interface InputExpr {
  n: Any;
  input: Any;
}

/**
 * Returns an aggregation of the minimum value n elements within a group.
 */
export const $minN: AccumulatorOperator = (
  collection: AnyObject[],
  expr: InputExpr,
  options: Options
): Any[] => {
  const copts = options as ComputeOptions;
  const m = collection.length;
  const n = evalExpr(copts?.local?.groupId, expr.n, copts) as number;
  if (!isInteger(n) || n < 1) {
    return errExpectNumber(options.failOnError, "$minN 'n'", INT_OPTS.pos);
  }
  const arr = $push(collection, expr.input, options).filter(o => !isNil(o));
  arr.sort(compare);
  return m <= n ? arr : arr.slice(0, n);
};
