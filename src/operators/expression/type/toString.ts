import { computeValue } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isDate, isNil, isPrimitive, isRegExp } from "../../../util/_internal";
import { errInvalidArgs } from "../_internal";

export const $toString: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): string | null => {
  const val = computeValue(obj, expr, null, options);
  if (isNil(val)) return null;
  if (isDate(val)) return val.toISOString();
  if (isPrimitive(val) || isRegExp(val)) return String(val as string);

  return errInvalidArgs(
    options.failOnError,
    "$toString cannot convert from object to string"
  );
};
