import { assert, isNumber } from "../../util";
import { $push } from "../accumulator/push";
import { TIMEUNIT_IN_MILLIS } from "../expression/date/_internal";
const $integral = (_, coll, expr, options) => {
  const { input, unit } = expr.inputExpr;
  const sortKey = "$" + Object.keys(expr.parentExpr.sortBy)[0];
  const points = $push(coll, [sortKey, input], options).filter(
    (([x, y]) => isNumber(+x) && isNumber(+y))
  );
  const size = points.length;
  assert(coll.length === size, "$integral expects an array of numeric values");
  let result = 0;
  for (let k = 1; k < size; k++) {
    const [x1, y1] = points[k - 1];
    const [x2, y2] = points[k];
    const deltaX = (x2 - x1) / TIMEUNIT_IN_MILLIS[unit ?? "millisecond"];
    result += 0.5 * (y1 + y2) * deltaX;
  }
  return result;
};
export {
  $integral
};
