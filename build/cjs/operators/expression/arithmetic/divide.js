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
var divide_exports = {};
__export(divide_exports, {
  $divide: () => $divide
});
module.exports = __toCommonJS(divide_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $divide = (obj, expr, options) => {
  (0, import_util.assert)((0, import_util.isArray)(expr), "$divide expects array(2)");
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  const foe = options.failOnError;
  if (args.some(import_util.isNil)) return null;
  if (!args.every(import_util.isNumber)) {
    return (0, import_internal2.errExpectArray)(foe, "$divide", {
      size: 2,
      type: "number"
    });
  }
  const [a, b] = args;
  if (b === 0) return (0, import_internal2.errInvalidArgs)(foe, "$divide cannot divide by zero");
  return a / b;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $divide
});
