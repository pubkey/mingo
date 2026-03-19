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
var last_exports = {};
__export(last_exports, {
  $last: () => $last
});
module.exports = __toCommonJS(last_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_last = require("../../accumulator/last");
var import_internal2 = require("../_internal");
const $last = (obj, expr, options) => {
  if ((0, import_util.isArray)(obj)) return (0, import_last.$last)(obj, expr, options);
  const arr = (0, import_internal.evalExpr)(obj, expr, options);
  if ((0, import_util.isNil)(arr)) return null;
  if (!(0, import_util.isArray)(arr) || arr.length === 0) {
    return (0, import_internal2.errExpectArray)(options.failOnError, "$last", { size: 0 });
  }
  return (0, import_util.flatten)(arr)[arr.length - 1];
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $last
});
