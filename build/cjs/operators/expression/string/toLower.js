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
var toLower_exports = {};
__export(toLower_exports, {
  $toLower: () => $toLower
});
module.exports = __toCommonJS(toLower_exports);
var import_internal = require("../../../util/_internal");
var import_type = require("../type");
const $toLower = (obj, expr, options) => {
  if ((0, import_internal.isArray)(expr) && expr.length === 1) expr = expr[0];
  const s = (0, import_type.$toString)(obj, expr, options);
  return s === null ? s : s.toLowerCase();
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $toLower
});
