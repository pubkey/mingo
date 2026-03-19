import { evalExpr } from "../../../core/_internal";
import { assert, isNil, isObject } from "../../../util";
import {
  adjustDate,
  DATE_FORMAT,
  DATE_FORMAT_SEP_RE,
  DATE_FORMAT_SYM_RE,
  DATE_SYM_TABLE,
  MINUTES_PER_HOUR,
  MONTHS,
  parseTimezone
} from "./_internal";
function tzLetterOffset(c) {
  if (c === "Z") return 0;
  if (c >= "A" && c < "N") return c.charCodeAt(0) - 64;
  return 77 - c.charCodeAt(0);
}
const regexStrip = (s) => s.replace(/^\//, "").replace(/\/$/, "").replace(/\/i/, "");
const REGEX_SPECIAL_CHARS = ["^", ".", "-", "*", "?", "$"];
function regexQuote(s) {
  REGEX_SPECIAL_CHARS.forEach((c) => {
    s = s.replace(c, `\\${c}`);
  });
  return s;
}
function $dateFromString(obj, expr, options) {
  const args = evalExpr(obj, expr, options);
  const format = args.format || DATE_FORMAT;
  const onNull = args.onNull || null;
  let dateString = args.dateString;
  if (isNil(dateString)) return onNull;
  const separators = format.split(DATE_FORMAT_SEP_RE);
  separators.reverse();
  const matches = format.match(DATE_FORMAT_SYM_RE);
  const dateParts = {};
  let expectedPattern = "";
  for (let i = 0, len = matches.length; i < len; i++) {
    const formatSpecifier = matches[i];
    const props = DATE_SYM_TABLE[formatSpecifier];
    if (isObject(props)) {
      const m2 = props.re.exec(dateString);
      const delimiter = separators.pop() || "";
      if (m2 !== null) {
        dateParts[props.name] = /^\d+$/.exec(m2[0]) ? parseInt(m2[0]) : m2[0];
        dateString = dateString.substring(m2.index + m2[0].length + 1);
        expectedPattern += regexQuote(delimiter) + regexStrip(props.re.toString());
      } else {
        dateParts[props.name] = null;
      }
    }
  }
  if (isNil(dateParts.month)) {
    const abbrMonth = (dateParts.full_month?.slice(0, 3) ?? dateParts.abbr_month ?? "").toLowerCase();
    if (MONTHS[abbrMonth]) {
      dateParts.month = MONTHS[abbrMonth];
    }
  }
  if (isNil(dateParts.year) || isNil(dateParts.month) || isNil(dateParts.day) || !new RegExp("^" + expectedPattern + "[A-Z]?$").test(args.dateString)) {
    return args.onError;
  }
  const m = args.dateString.match(/([A-Z])$/);
  assert(
    // only one of in-date timeone or timezone argument but not both.
    !(m && args.timezone),
    `$dateFromString: you cannot pass in a date/time string with time zone information ('${m && m[0]}') together with a timezone argument`
  );
  const minuteOffset = m ? tzLetterOffset(m[0]) * MINUTES_PER_HOUR : parseTimezone(args.timezone, /* @__PURE__ */ new Date());
  const d = new Date(
    Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day, 0, 0, 0)
  );
  if (!isNil(dateParts.hour)) d.setUTCHours(dateParts.hour);
  if (!isNil(dateParts.minute)) d.setUTCMinutes(dateParts.minute);
  if (!isNil(dateParts.second)) d.setUTCSeconds(dateParts.second);
  if (!isNil(dateParts.millisecond))
    d.setUTCMilliseconds(dateParts.millisecond);
  adjustDate(d, -minuteOffset);
  return d;
}
export {
  $dateFromString
};
