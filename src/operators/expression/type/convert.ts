import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { assert, isNil } from "../../../util";
import { $toBool } from "./toBool";
import { $toDate } from "./toDate";
import { $toDouble } from "./toDouble";
import { $toInt } from "./toInt";
import { $toLong } from "./toLong";
import { $toString } from "./toString";

interface ConvertOptions {
  input: Any;
  to: string | number;
  onError?: Any;
  onNull?: Any;
}

/**
 * Converts a value to a specified type.
 *
 * @param obj
 * @param expr
 */
export const $convert: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): Any => {
  const args = computeValue(obj, expr, null, options) as ConvertOptions;

  args.onNull = args.onNull === undefined ? null : args.onNull;

  if (isNil(args.input)) return args.onNull;

  try {
    switch (args.to) {
      case 2:
      case "string":
        return $toString(obj, args.input, options);

      case 8:
      case "boolean":
      case "bool":
        return $toBool(obj, args.input, options);

      case 9:
      case "date":
        return $toDate(obj, args.input, options);

      case 1:
      case 19:
      case "double":
      case "decimal":
      case "number":
        return $toDouble(obj, args.input, options);

      case 16:
      case "int":
        return $toInt(obj, args.input, options);

      case 18:
      case "long":
        return $toLong(obj, args.input, options);
    }
  } catch {
    /*nothing to do*/
  }

  assert(args.onError !== undefined, `could not convert to type ${args.to}.`);
  return args.onError;
};
