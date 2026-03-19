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
var import_internal = require("../../core/_internal");
const $last = (coll, expr, options) => {
  const obj = coll[coll.length - 1];
  const copts = import_internal.ComputeOptions.init(options).update({ root: obj });
  return (0, import_internal.evalExpr)(obj, expr, copts) ?? null;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $last
});
