import { evalExpr } from "../../../core/_internal";
import { isNumber, isRegExp, typeOf } from "../../../util";
import { MAX_INT, MIN_INT } from "./_internal";
const $type = (obj, expr, options) => {
  const v = evalExpr(obj, expr, options);
  if (options.useStrictMode) {
    if (v === void 0) return "missing";
    if (v === true || v === false) return "bool";
    if (isNumber(v)) {
      if (v % 1 != 0) return "double";
      return v >= MIN_INT && v <= MAX_INT ? "int" : "long";
    }
    if (isRegExp(v)) return "regex";
  }
  return typeOf(v);
};
export {
  $type
};
