import { evalExpr } from "../../../core/_internal";
import { isNumber } from "../../../util";
import { errExpectNumber } from "../_internal";
function processOperator(obj, expr, options, fn, fixedPoints) {
  const fp = {
    undefined: null,
    null: null,
    NaN: NaN,
    Infinity: new Error(),
    "-Infinity": new Error(),
    ...fixedPoints
  };
  const foe = options.failOnError;
  const op = fn.name;
  const n = evalExpr(obj, expr, options);
  if (n in fp) {
    const res = fp[n];
    if (res instanceof Error)
      return errExpectNumber(foe, `$${op} invalid input '${n}'`);
    return res;
  }
  if (!isNumber(n)) return errExpectNumber(foe, `$${op}`);
  return fn(n);
}
export {
  processOperator
};
