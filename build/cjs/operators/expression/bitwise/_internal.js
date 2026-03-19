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
var internal_exports = {};
__export(internal_exports, {
  processBitwise: () => processBitwise
});
module.exports = __toCommonJS(internal_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
function processBitwise(obj, expr, options, operator, fn) {
  (0, import_util.assert)((0, import_util.isArray)(expr), `${operator} expects array as argument`);
  const nums = (0, import_internal.evalExpr)(obj, expr, options);
  if (nums.some(import_util.isNil)) return null;
  if (!nums.every(import_util.isNumber))
    return (0, import_internal2.errInvalidArgs)(
      options.failOnError,
      `${operator} array elements must resolve to integers`
    );
  return fn(nums);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  processBitwise
});
