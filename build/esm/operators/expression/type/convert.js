import { evalExpr } from "../../../core/_internal";
import { assert, has, isNil, isObject } from "../../../util";
import { errInvalidArgs } from "../_internal";
import { $toBool } from "./toBool";
import { $toDate } from "./toDate";
import { $toDouble } from "./toDouble";
import { $toInt } from "./toInt";
import { $toLong } from "./toLong";
import { $toString } from "./toString";
const $convert = (obj, expr, options) => {
  assert(
    isObject(expr) && has(expr, "input", "to"),
    "$convert expects object { input, to, onError, onNull }"
  );
  const input = evalExpr(obj, expr.input, options);
  if (isNil(input)) return evalExpr(obj, expr.onNull, options) ?? null;
  const toExpr = evalExpr(obj, expr.to, options);
  try {
    switch (toExpr) {
      case 2:
      case "string":
        return $toString(obj, input, options);
      case 8:
      case "boolean":
      case "bool":
        return $toBool(obj, input, options);
      case 9:
      case "date":
        return $toDate(obj, input, options);
      case 1:
      case 19:
      case "double":
      case "decimal":
      case "number":
        return $toDouble(obj, input, options);
      case 16:
      case "int":
        return $toInt(obj, input, options);
      case 18:
      case "long":
        return $toLong(obj, input, options);
    }
  } catch {
  }
  if (expr.onError === void 0)
    return errInvalidArgs(
      options.failOnError,
      `$convert cannot convert from object to ${expr.to} with no onError value`
    );
  return evalExpr(obj, expr.onError, options);
};
export {
  $convert
};
