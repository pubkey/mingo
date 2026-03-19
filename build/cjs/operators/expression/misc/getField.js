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
var getField_exports = {};
__export(getField_exports, {
  $getField: () => $getField
});
module.exports = __toCommonJS(getField_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
const $getField = (obj, expr, options) => {
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  const { field, input } = (0, import_util.isString)(args) ? { field: args, input: obj } : { field: args.field, input: args.input ?? obj };
  if ((0, import_util.isNil)(input)) return null;
  return input[field];
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $getField
});
