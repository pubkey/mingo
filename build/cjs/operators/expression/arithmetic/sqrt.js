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
var sqrt_exports = {};
__export(sqrt_exports, {
  $sqrt: () => $sqrt
});
module.exports = __toCommonJS(sqrt_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
const $sqrt = (obj, expr, options) => {
  const n = (0, import_internal.evalExpr)(obj, expr, options);
  const skip = !options.failOnError;
  if ((0, import_util.isNil)(n)) return null;
  if (typeof n !== "number" || n < 0) {
    (0, import_util.assert)(skip, "$sqrt expression must resolve to non-negative number.");
    return null;
  }
  return Math.sqrt(n);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $sqrt
});
