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
var log_exports = {};
__export(log_exports, {
  $log: () => $log
});
module.exports = __toCommonJS(log_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $log = (obj, expr, options) => {
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  if ((0, import_util.isArray)(args) && args.length == 2) {
    if (args.some(import_util.isNil)) return null;
    if (args.every((v) => typeof v === "number"))
      return Math.log10(args[0]) / Math.log10(args[1]);
  }
  return (0, import_internal2.errExpectArray)(options.failOnError, "$log", {
    size: 2,
    type: "number"
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $log
});
