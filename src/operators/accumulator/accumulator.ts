import { ComputeOptions, computeValue } from "../../core/_internal";
import {
  AccumulatorOperator,
  Any,
  AnyObject,
  Callback,
  Options
} from "../../types";
import { assert } from "../../util";
import { $push } from "./push";

interface AccumulatorExpr {
  /** Function used to initialize the state. */
  readonly init: Callback<Any>;
  /** Arguments passed to the init function. */
  readonly initArgs?: Any[];
  /** Function used to accumulate documents.*/
  readonly accumulate: Callback<Any>;
  /** Arguments passed to the accumulate function. */
  readonly accumulateArgs: Any[];
  /** unused */
  readonly merge?: Callback<Any>;
  /** Function used to update the result of the accumulation. */
  readonly finalize?: Callback<Any>;
  readonly lang: "js";
}

/**
 * Defines a custom accumulator function.
 *
 * @param {Any[]} collection The input array
 * @param {*} expr The expression for the operator
 * @param {Options} options Options
 */
export const $accumulator: AccumulatorOperator = (
  collection: AnyObject[],
  expr: AccumulatorExpr,
  options: Options
): Any => {
  assert(
    !!options && options.scriptEnabled,
    "$accumulator operator requires 'scriptEnabled' option to be true"
  );

  const copts = ComputeOptions.init(options);

  const initArgs = computeValue(
    copts?.local?.groupId,
    expr.initArgs || [],
    null,
    copts.update({ root: copts?.local?.groupId })
  ) as Any[];

  const args = $push(collection, expr.accumulateArgs, copts) as Any[][];
  args.forEach(arr => arr.forEach((v, i) => (arr[i] = v ?? null)));
  const initialValue = expr.init.apply(null, initArgs) as Any;
  const result = args.reduce(
    (acc, v) => expr.accumulate.apply(null, [acc, ...v]) as Any,
    initialValue
  );

  return (expr.finalize ? expr.finalize.call(null, result) : result) as Any;
};
