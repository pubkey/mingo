import { evalExpr } from "../../../core/_internal";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { isNumber, isRegExp, typeOf } from "../../../util";
import { MAX_INT, MIN_INT } from "./_internal";

export const $type: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): string => {
  const v = evalExpr(obj, expr, options);
  if (options.useStrictMode) {
    if (v === undefined) return "missing";
    if (v === true || v === false) return "bool";
    if (isNumber(v)) {
      if (v % 1 != 0) return "double";
      return v >= MIN_INT && v <= MAX_INT ? "int" : "long";
    }
    if (isRegExp(v)) return "regex";
  }
  return typeOf(v);
};
