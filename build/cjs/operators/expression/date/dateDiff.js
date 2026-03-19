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
var dateDiff_exports = {};
__export(dateDiff_exports, {
  $dateDiff: () => $dateDiff
});
module.exports = __toCommonJS(dateDiff_exports);
var import_internal = require("../../../core/_internal");
var import_internal2 = require("./_internal");
const $dateDiff = (obj, expr, options) => {
  const { startDate, endDate, unit, timezone, startOfWeek } = (0, import_internal.evalExpr)(
    obj,
    expr,
    options
  );
  const d1 = new Date(startDate);
  const d2 = new Date(endDate);
  (0, import_internal2.adjustDate)(d1, (0, import_internal2.parseTimezone)(timezone, d1));
  (0, import_internal2.adjustDate)(d2, (0, import_internal2.parseTimezone)(timezone, d2));
  switch (unit) {
    case "year":
      return (0, import_internal2.dateDiffYear)(d1, d2);
    case "quarter":
      return (0, import_internal2.dateDiffQuarter)(d1, d2);
    case "month":
      return (0, import_internal2.dateDiffMonth)(d1, d2);
    case "week":
      return (0, import_internal2.dateDiffWeek)(d1, d2, startOfWeek);
    case "day":
      return (0, import_internal2.dateDiffDay)(d1, d2);
    case "hour":
      return (0, import_internal2.dateDiffHour)(d1, d2);
    case "minute":
      d1.setUTCSeconds(0);
      d1.setUTCMilliseconds(0);
      d2.setUTCSeconds(0);
      d2.setUTCMilliseconds(0);
      return Math.round(
        (d2.getTime() - d1.getTime()) / import_internal2.TIMEUNIT_IN_MILLIS[unit]
      );
    default:
      return Math.round(
        (d2.getTime() - d1.getTime()) / import_internal2.TIMEUNIT_IN_MILLIS[unit]
      );
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $dateDiff
});
