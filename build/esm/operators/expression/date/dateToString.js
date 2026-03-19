import { evalExpr } from "../../../core/_internal";
import { assert, isNil } from "../../../util";
import {
  adjustDate,
  computeDate,
  DATE_FORMAT,
  DATE_FORMAT_SYM_RE,
  DATE_SYM_TABLE,
  dayOfYear,
  formatTimezone,
  isoWeek,
  padDigits,
  parseTimezone,
  weekOfYear
} from "./_internal";
const DATE_FUNCTIONS = {
  "%Y": (d) => d.getUTCFullYear(),
  //year
  "%G": (d) => d.getUTCFullYear(),
  //year
  "%m": (d) => d.getUTCMonth() + 1,
  //month
  "%d": (d) => d.getUTCDate(),
  //dayOfMonth
  "%H": (d) => d.getUTCHours(),
  //hour
  "%M": (d) => d.getUTCMinutes(),
  //minutes
  "%S": (d) => d.getUTCSeconds(),
  //seconds
  "%L": (d) => d.getUTCMilliseconds(),
  //milliseconds
  "%u": (d) => d.getUTCDay() || 7,
  //isoDayOfWeek
  "%U": weekOfYear,
  "%V": isoWeek,
  "%j": dayOfYear,
  "%w": (d) => d.getUTCDay()
  //dayOfWeek
};
const $dateToString = (obj, expr, options) => {
  const args = evalExpr(obj, expr, options);
  if (isNil(args.onNull)) args.onNull = null;
  if (isNil(args.date)) return args.onNull;
  const date = computeDate(obj, args.date, options);
  let format = args.format ?? DATE_FORMAT;
  const minuteOffset = parseTimezone(args.timezone, date);
  const matches = format.match(DATE_FORMAT_SYM_RE);
  if (!matches) return format;
  adjustDate(date, minuteOffset);
  for (let i = 0, len = matches.length; i < len; i++) {
    const formatSpec = matches[i];
    assert(
      formatSpec in DATE_SYM_TABLE,
      `$dateToString: invalid format specifier ${formatSpec}`
    );
    const { name, padding } = DATE_SYM_TABLE[formatSpec];
    const fn = DATE_FUNCTIONS[formatSpec];
    let value = "";
    if (fn) {
      value = padDigits(fn(date), padding);
    } else {
      switch (name) {
        case "timezone":
          value = formatTimezone(minuteOffset);
          break;
        case "minute_offset":
          value = minuteOffset.toString();
          break;
        case "abbr_month":
        case "full_month": {
          const format2 = name.startsWith("abbr") ? "short" : "long";
          value = date.toLocaleString("en-US", { month: format2 });
          break;
        }
      }
    }
    format = format.replace(formatSpec, value);
  }
  return format;
};
export {
  $dateToString
};
