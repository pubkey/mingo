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
var sigmoid_exports = {};
__export(sigmoid_exports, {
  $sigmoid: () => $sigmoid
});
module.exports = __toCommonJS(sigmoid_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const PRECISION = 1e10;
const $sigmoid = (obj, expr, options) => {
  if ((0, import_util.isNil)(expr)) return null;
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  const { input, onNull } = (0, import_util.isObject)(args) ? args : { input: args };
  if ((0, import_util.isNil)(input)) return (0, import_util.isNumber)(onNull) ? onNull : null;
  if ((0, import_util.isNumber)(input)) {
    const result = 1 / (1 + Math.exp(-input));
    return Math.round(result * PRECISION) / PRECISION;
  }
  return (0, import_internal2.errExpectNumber)(options.failOnError, "$sigmoid");
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $sigmoid
});
