import { assert, isNumber } from "../../util";
import { $push } from "../accumulator/push";
import { TIMEUNIT_IN_MILLIS } from "../expression/date/_internal";
const $derivative = (_, coll, expr, options) => {
  if (coll.length < 2) return null;
  const { input, unit } = expr.inputExpr;
  const sortKey = "$" + Object.keys(expr.parentExpr.sortBy)[0];
  const values = [coll[0], coll[coll.length - 1]];
  const points = $push(values, [sortKey, input], options).filter(
    (([x, y]) => isNumber(+x) && isNumber(+y))
  );
  assert(points.length === 2, "$derivative arguments must resolve to numeric");
  const [[x1, y1], [x2, y2]] = points;
  const deltaX = (x2 - x1) / TIMEUNIT_IN_MILLIS[unit ?? "millisecond"];
  return (y2 - y1) / deltaX;
};
export {
  $derivative
};
