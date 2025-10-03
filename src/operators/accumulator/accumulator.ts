import {
  AccumulatorOperator,
  ComputeOptions,
  computeValue,
  Options
} from "../../core";
import { Any, AnyObject, Callback } from "../../types";
import { assert } from "../../util";

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

  if (collection.length == 0) return expr.initArgs;

  const copts = ComputeOptions.init(options);

  const initArgs = computeValue(
    copts?.local?.groupId,
    expr.initArgs || [],
    null,
    copts.update({ root: copts?.local?.groupId })
  ) as Any[];

  let state = expr.init.call(null, ...initArgs) as Any;

  for (const doc of collection) {
    // get arguments for document
    const args = computeValue(
      doc,
      expr.accumulateArgs,
      null,
      copts.update({ root: doc })
    ) as Any[];
    // update the state with each documents value
    state = expr.accumulate.call(null, ...[state, ...args]) as Any;
  }

  return (expr.finalize ? expr.finalize.call(null, state) : state) as Any;
};
