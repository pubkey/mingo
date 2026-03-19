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
var strLenCP_exports = {};
__export(strLenCP_exports, {
  $strLenCP: () => $strLenCP
});
module.exports = __toCommonJS(strLenCP_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $strLenCP = (obj, expr, options) => {
  const s = (0, import_internal.evalExpr)(obj, expr, options);
  if (!(0, import_util.isString)(s)) return (0, import_internal2.errExpectString)(options.failOnError, "$strLenCP");
  return s.length;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $strLenCP
});
