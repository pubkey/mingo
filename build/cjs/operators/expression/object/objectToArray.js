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
var objectToArray_exports = {};
__export(objectToArray_exports, {
  $objectToArray: () => $objectToArray
});
module.exports = __toCommonJS(objectToArray_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $objectToArray = (obj, expr, options) => {
  const val = (0, import_internal.evalExpr)(obj, expr, options);
  if ((0, import_util.isNil)(val)) return null;
  if (!(0, import_util.isObject)(val))
    return (0, import_internal2.errExpectObject)(options.failOnError, "$objectToArray");
  const entries = Object.entries(val);
  const result = new Array(entries.length);
  let i = 0;
  for (const [k, v] of entries) {
    result[i++] = { k, v };
  }
  return result;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $objectToArray
});
