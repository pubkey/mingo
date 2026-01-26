import { computeValue } from "../../../core";
import { Any, AnyObject, ExpressionOperator, Options } from "../../../types";
import { assert, has, isNil, isObject } from "../../../util";
import { errInvalidArgs } from "../_internal";
import { $toBool } from "./toBool";
import { $toDate } from "./toDate";
import { $toDouble } from "./toDouble";
import { $toInt } from "./toInt";
import { $toLong } from "./toLong";
import { $toString } from "./toString";

interface InputExpr {
  input: Any;
  to: string | number;
  onError?: Any;
  onNull?: Any;
}

/**
 * Converts a value to a specified type.
 */
export const $convert: ExpressionOperator = (
  obj: AnyObject,
  expr: InputExpr,
  options: Options
): Any => {
  assert(
    isObject(expr) && has(expr, "input", "to"),
    "$convert expects object { input, to, onError, onNull }"
  );
  const { input, onNull, onError } = expr;
  const toExpr = computeValue(obj, expr.to, null, options) as string | number;

  if (isNil(input)) return onNull;

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
    /*nothing to do*/
  }

  if (onError === undefined)
    return errInvalidArgs(
      options.failOnError,
      `$convert cannot convert from object to ${expr.to} with no onError value`
    );

  return computeValue(obj, onError, null, options);
};
