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
var min_exports = {};
__export(min_exports, {
  $min: () => $min
});
module.exports = __toCommonJS(min_exports);
var import_util = require("../../util");
var import_push = require("./push");
const $min = (coll, expr, options) => {
  const items = (0, import_push.$push)(coll, expr, options).filter((v) => !(0, import_util.isNil)(v));
  if (!items.length) return null;
  return items.reduce((r, v) => (0, import_util.compare)(r, v) <= 0 ? r : v);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $min
});
