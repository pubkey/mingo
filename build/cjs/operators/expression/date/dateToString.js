var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var dateToString_exports = {};
__export(dateToString_exports, {
  $dateToString: () => $dateToString
});
module.exports = __toCommonJS(dateToString_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("./_internal");
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
  "%U": import_internal2.weekOfYear,
  "%V": import_internal2.isoWeek,
  "%j": import_internal2.dayOfYear,
  "%w": (d) => d.getUTCDay()
  //dayOfWeek
};
const $dateToString = (obj, expr, options) => {
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  if ((0, import_util.isNil)(args.onNull)) args.onNull = null;
  if ((0, import_util.isNil)(args.date)) return args.onNull;
  const date = (0, import_internal2.computeDate)(obj, args.date, options);
  let format = args.format ?? import_internal2.DATE_FORMAT;
  const minuteOffset = (0, import_internal2.parseTimezone)(args.timezone, date);
  const matches = format.match(import_internal2.DATE_FORMAT_SYM_RE);
  if (!matches) return format;
  (0, import_internal2.adjustDate)(date, minuteOffset);
  for (let i = 0, len = matches.length; i < len; i++) {
    const formatSpec = matches[i];
    (0, import_util.assert)(
      formatSpec in import_internal2.DATE_SYM_TABLE,
      `$dateToString: invalid format specifier ${formatSpec}`
    );
    const { name, padding } = import_internal2.DATE_SYM_TABLE[formatSpec];
    const fn = DATE_FUNCTIONS[formatSpec];
    let value = "";
    if (fn) {
      value = (0, import_internal2.padDigits)(fn(date), padding);
    } else {
      switch (name) {
        case "timezone":
          value = (0, import_internal2.formatTimezone)(minuteOffset);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $dateToString
});
