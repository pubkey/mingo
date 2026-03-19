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
var shift_exports = {};
__export(shift_exports, {
  $shift: () => $shift
});
module.exports = __toCommonJS(shift_exports);
var import_internal = require("../../core/_internal");
const $shift = (obj, coll, expr, options) => {
  const input = expr.inputExpr;
  const shiftedIndex = expr.documentNumber - 1 + input.by;
  if (shiftedIndex < 0 || shiftedIndex > coll.length - 1) {
    return (0, import_internal.evalExpr)(obj, input.default, options) ?? null;
  }
  return (0, import_internal.evalExpr)(coll[shiftedIndex], input.output, options);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $shift
});
