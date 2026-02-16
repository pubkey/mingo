import { Any, AnyObject, Options } from "../../types";
import { isNil } from "../../util";
import { $push } from "../accumulator/push";
import { WindowOperatorInput, withMemo } from "./_internal";

/**
 * Last observation carried forward. Sets values for null and missing fields in a window to the last non-null value for the field.
 */
export const $locf = (
  _: AnyObject,
  coll: AnyObject[],
  expr: WindowOperatorInput,
  options: Options
): Any => {
  return withMemo(
    coll,
    expr,
    () => {
      const values = $push(coll, expr.inputExpr, options);
      for (let i = 1; i < values.length; i++) {
        if (isNil(values[i])) values[i] = values[i - 1];
      }
      return values;
    },
    (series: Any[]) => series[expr.documentNumber - 1]
  );
};
