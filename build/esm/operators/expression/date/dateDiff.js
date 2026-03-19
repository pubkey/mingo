import { evalExpr } from "../../../core/_internal";
import {
  adjustDate,
  dateDiffDay,
  dateDiffHour,
  dateDiffMonth,
  dateDiffQuarter,
  dateDiffWeek,
  dateDiffYear,
  parseTimezone,
  TIMEUNIT_IN_MILLIS
} from "./_internal";
const $dateDiff = (obj, expr, options) => {
  const { startDate, endDate, unit, timezone, startOfWeek } = evalExpr(
    obj,
    expr,
    options
  );
  const d1 = new Date(startDate);
  const d2 = new Date(endDate);
  adjustDate(d1, parseTimezone(timezone, d1));
  adjustDate(d2, parseTimezone(timezone, d2));
  switch (unit) {
    case "year":
      return dateDiffYear(d1, d2);
    case "quarter":
      return dateDiffQuarter(d1, d2);
    case "month":
      return dateDiffMonth(d1, d2);
    case "week":
      return dateDiffWeek(d1, d2, startOfWeek);
    case "day":
      return dateDiffDay(d1, d2);
    case "hour":
      return dateDiffHour(d1, d2);
    case "minute":
      d1.setUTCSeconds(0);
      d1.setUTCMilliseconds(0);
      d2.setUTCSeconds(0);
      d2.setUTCMilliseconds(0);
      return Math.round(
        (d2.getTime() - d1.getTime()) / TIMEUNIT_IN_MILLIS[unit]
      );
    default:
      return Math.round(
        (d2.getTime() - d1.getTime()) / TIMEUNIT_IN_MILLIS[unit]
      );
  }
};
export {
  $dateDiff
};
