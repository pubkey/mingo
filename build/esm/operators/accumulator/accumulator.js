import { ComputeOptions, evalExpr } from "../../core/_internal";
import { assert } from "../../util";
import { $push } from "./push";
const $accumulator = (coll, expr, options) => {
  assert(
    options.scriptEnabled,
    "$accumulator requires 'scriptEnabled' option to be true"
  );
  const copts = ComputeOptions.init(options);
  const input = expr;
  const initArgs = evalExpr(
    copts?.local?.groupId,
    input.initArgs || [],
    copts.update({ root: copts?.local?.groupId })
  );
  const args = $push(coll, input.accumulateArgs, copts);
  for (let i = 0; i < args.length; i++) {
    for (let j = 0; j < args[i].length; j++) {
      args[i][j] = args[i][j] ?? null;
    }
  }
  const initialValue = input.init.apply(null, initArgs);
  const f = input.accumulate;
  let result = initialValue;
  for (let i = 0; i < args.length; i++) {
    result = f.apply(null, [result, ...args[i]]);
  }
  if (input.finalize) result = input.finalize.call(null, result);
  return result;
};
export {
  $accumulator
};
