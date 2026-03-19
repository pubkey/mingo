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
var concatArrays_exports = {};
__export(concatArrays_exports, {
  $concatArrays: () => $concatArrays
});
module.exports = __toCommonJS(concatArrays_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $concatArrays = (obj, expr, options) => {
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  const foe = options.failOnError;
  if ((0, import_util.isNil)(args)) return null;
  if (!(0, import_util.isArray)(args)) return (0, import_internal2.errExpectArray)(foe, "$concatArrays");
  let size = 0;
  for (const arr of args) {
    if ((0, import_util.isNil)(arr)) return null;
    if (!(0, import_util.isArray)(arr)) return (0, import_internal2.errExpectArray)(foe, "$concatArrays");
    size += arr.length;
  }
  const result = new Array(size);
  let i = 0;
  for (const arr of args) for (const item of arr) result[i++] = item;
  return result;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $concatArrays
});
