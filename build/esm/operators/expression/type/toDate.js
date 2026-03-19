import { evalExpr } from "../../../core/_internal";
import { assert, isDate, isNil } from "../../../util";
const $toDate = (obj, expr, options) => {
  const val = evalExpr(obj, expr, options);
  if (isDate(val)) return val;
  if (isNil(val)) return null;
  const d = new Date(val);
  assert(!isNaN(d.getTime()), `cannot convert '${val}' to date`);
  return d;
};
export {
  $toDate
};
