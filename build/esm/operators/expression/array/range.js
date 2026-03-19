import { evalExpr } from "../../../core/_internal";
import { assert, isArray, isInteger } from "../../../util";
import { errExpectNumber, INT_OPTS } from "../_internal";
const $range = (obj, expr, options) => {
  assert(
    isArray(expr) && expr.length > 1 && expr.length < 4,
    "$range expects array(3)"
  );
  const [start, end, arg3] = evalExpr(obj, expr, options);
  const foe = options.failOnError;
  const step = arg3 ?? 1;
  if (!isInteger(start))
    return errExpectNumber(foe, `$range arg1 <start>`, INT_OPTS.int);
  if (!isInteger(end))
    return errExpectNumber(foe, `$range arg2 <end>`, INT_OPTS.int);
  if (!isInteger(step) || step === 0)
    return errExpectNumber(foe, `$range arg3 <step>`, INT_OPTS.nzero);
  const result = new Array();
  let counter = start;
  while (counter < end && step > 0 || counter > end && step < 0) {
    result.push(counter);
    counter += step;
  }
  return result;
};
export {
  $range
};
