import { evalExpr } from "../../../core/_internal";
import { adjustDate, isoWeek, isoWeekYear, parseTimezone } from "./_internal";
const $dateToParts = (obj, expr, options) => {
  const args = evalExpr(obj, expr, options);
  const d = new Date(args.date);
  adjustDate(d, parseTimezone(args.timezone, d));
  const timePart = {
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    millisecond: d.getUTCMilliseconds()
  };
  if (args.iso8601 == true) {
    return Object.assign(timePart, {
      isoWeekYear: isoWeekYear(d),
      isoWeek: isoWeek(d),
      isoDayOfWeek: d.getUTCDay() || 7
    });
  }
  return Object.assign(timePart, {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate()
  });
};
export {
  $dateToParts
};
