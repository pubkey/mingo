import { evalExpr } from "../../../core/_internal";
import { assert, isArray, isDate, isNil, isNumber } from "../../../util";
import { errExpectArray, errInvalidArgs } from "../_internal";
const $subtract = (obj, expr, options) => {
  assert(isArray(expr), "$subtract expects array(2)");
  const args = evalExpr(obj, expr, options);
  if (args.some(isNil)) return null;
  const foe = options.failOnError;
  const [a, b] = args;
  if (isDate(a) && isNumber(b)) return new Date(+a - Math.round(b));
  if (isDate(a) && isDate(b)) return +a - +b;
  if (args.every((v) => typeof v === "number")) return a - b;
  if (isNumber(a) && isDate(b)) {
    return errInvalidArgs(foe, "$subtract cannot subtract date from number");
  }
  return errExpectArray(foe, "$subtract", {
    size: 2,
    type: "number|date"
  });
};
export {
  $subtract
};
