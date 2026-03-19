import { evalExpr } from "../../../core/_internal";
import { assert, isDate, isNil, isNumber } from "../../../util";
const $toDouble = (obj, expr, options) => {
  const val = evalExpr(obj, expr, options);
  if (isNil(val)) return null;
  if (isDate(val)) return val.getTime();
  if (val === true) return 1;
  if (val === false) return 0;
  const n = Number(val);
  assert(isNumber(n), `cannot convert '${val}' to double/decimal`);
  return n;
};
export {
  $toDouble
};
