import { Options } from "../../core/_internal";
import { Any, AnyObject, Callback } from "../../types";
import { isNumber } from "../../util";
import { $push } from "../accumulator/push";
import { TIMEUNIT_IN_MILLIS } from "../expression/date/_internal";
import { WindowOperatorInput, WindowTimeUnit } from "./_internal";

/**
 * Returns the approximation of the area under a curve.
 */
export const $integral = (
  _: AnyObject,
  collection: AnyObject[],
  expr: WindowOperatorInput,
  options: Options
): Any => {
  const { input, unit } = expr.inputExpr as {
    input: Any;
    unit?: WindowTimeUnit;
  };
  const sortKey = "$" + Object.keys(expr.parentExpr.sortBy)[0];
  // compute the points the expressions for X and Y
  const points = $push(collection, [sortKey, input], options).filter(
    (([x, y]: number[]) => isNumber(+x) && isNumber(+y)) as Callback
  ) as number[][];

  // invalid values found
  if (points.length !== collection.length) return null;

  let result = 0;
  const size = collection.length;

  for (let k = 1; k < size; k++) {
    const [x1, y1] = points[k - 1];
    const [x2, y2] = points[k];
    // convert from millis to the unit.
    const deltaX = (x2 - x1) / (TIMEUNIT_IN_MILLIS[unit] || 1);
    result += 0.5 * (y1 + y2) * deltaX;
  }

  return result;
};
