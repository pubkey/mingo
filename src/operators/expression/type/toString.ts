import {
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core/_internal";
import { Any, AnyObject } from "../../../types";
import { isDate, isNil } from "../../../util";
import { $dateToString } from "../date/dateToString";

export const $toString: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): string | null => {
  const val = computeValue(obj, expr, null, options);
  if (isNil(val)) return null;

  if (isDate(val)) {
    return $dateToString(
      obj,
      {
        date: expr,
        format: "%Y-%m-%dT%H:%M:%S.%LZ"
      },
      options
    );
  }
  return (val as { toString(): string }).toString();
};
