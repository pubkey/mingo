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
var not_exports = {};
__export(not_exports, {
  $not: () => $not
});
module.exports = __toCommonJS(not_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $not = (obj, expr, options) => {
  const booleanExpr = (0, import_util.ensureArray)(expr);
  if (booleanExpr.length === 0) return false;
  if (booleanExpr.length > 1)
    return (0, import_internal2.errExpectArray)(options.failOnError, "$not", { size: 1 });
  return !(0, import_internal.evalExpr)(obj, booleanExpr[0], options);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $not
});
