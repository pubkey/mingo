import { ComputeOptions, evalExpr } from "../../core/_internal";
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

/** Defines a custom accumulator function. */
export const $accumulator: AccumulatorOperator = (
  collection: AnyObject[],
  expr: AccumulatorExpr,
  options: Options
): Any => {
  assert(
    options.scriptEnabled,
    "$accumulator requires 'scriptEnabled' option to be true"
  );

  const copts = ComputeOptions.init(options);

  const initArgs = evalExpr(
    copts?.local?.groupId,
    expr.initArgs || [],
    copts.update({ root: copts?.local?.groupId })
  ) as Any[];

  const args = $push(collection, expr.accumulateArgs, copts) as Any[][];
  for (let i = 0; i < args.length; i++) {
    for (let j = 0; j < args[i].length; j++) {
      args[i][j] = args[i][j] ?? null;
    }
  }

  const initialValue = expr.init.apply(null, initArgs) as Any;
  const f = expr.accumulate;
  let result = initialValue;
  for (let i = 0; i < args.length; i++) {
    result = f.apply(null, [result, ...args[i]]) as Any;
  }
  if (expr.finalize) result = expr.finalize.call(null, result);
  return result;
};
