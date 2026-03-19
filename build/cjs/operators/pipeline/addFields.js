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
var addFields_exports = {};
__export(addFields_exports, {
  $addFields: () => $addFields
});
module.exports = __toCommonJS(addFields_exports);
var import_internal = require("../../core/_internal");
var import_util = require("../../util");
function $addFields(coll, expr, options) {
  const newFields = Object.keys(expr);
  if (newFields.length === 0) return coll;
  return coll.map((obj) => {
    const newObj = { ...obj };
    for (const field of newFields) {
      const newValue = (0, import_internal.evalExpr)(obj, expr[field], options);
      if (newValue !== void 0) {
        (0, import_util.setValue)(newObj, field, newValue);
      } else {
        (0, import_util.removeValue)(newObj, field);
      }
    }
    return newObj;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $addFields
});
