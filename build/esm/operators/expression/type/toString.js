import { evalExpr } from "../../../core/_internal";
import { isDate, isNil, isPrimitive, isRegExp } from "../../../util/_internal";
import { errInvalidArgs } from "../_internal";
const $toString = (obj, expr, options) => {
  const val = evalExpr(obj, expr, options);
  if (isNil(val)) return null;
  if (isDate(val)) return val.toISOString();
  if (isPrimitive(val) || isRegExp(val)) return String(val);
  return errInvalidArgs(
    options.failOnError,
    "$toString cannot convert from object to string"
  );
};
export {
  $toString
};
