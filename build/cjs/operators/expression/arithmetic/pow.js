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
var pow_exports = {};
__export(pow_exports, {
  $pow: () => $pow
});
module.exports = __toCommonJS(pow_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $pow = (obj, expr, options) => {
  (0, import_util.assert)((0, import_util.isArray)(expr) && expr.length === 2, "$pow expects array(2)");
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  const foe = options.failOnError;
  if (args.some(import_util.isNil)) return null;
  if (!args.every(import_util.isNumber)) {
    return (0, import_internal2.errExpectArray)(foe, "$pow", {
      size: 2,
      type: "number"
    });
  }
  const [n, exponent] = args;
  return n === 0 && exponent < 0 ? (0, import_internal2.errInvalidArgs)(foe, "$pow cannot raise 0 to a negative exponent") : Math.pow(n, exponent);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $pow
});
