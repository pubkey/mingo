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
var subtract_exports = {};
__export(subtract_exports, {
  $subtract: () => $subtract
});
module.exports = __toCommonJS(subtract_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $subtract = (obj, expr, options) => {
  (0, import_util.assert)((0, import_util.isArray)(expr), "$subtract expects array(2)");
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  if (args.some(import_util.isNil)) return null;
  const foe = options.failOnError;
  const [a, b] = args;
  if ((0, import_util.isDate)(a) && (0, import_util.isNumber)(b)) return new Date(+a - Math.round(b));
  if ((0, import_util.isDate)(a) && (0, import_util.isDate)(b)) return +a - +b;
  if (args.every((v) => typeof v === "number")) return a - b;
  if ((0, import_util.isNumber)(a) && (0, import_util.isDate)(b)) {
    return (0, import_internal2.errInvalidArgs)(foe, "$subtract cannot subtract date from number");
  }
  return (0, import_internal2.errExpectArray)(foe, "$subtract", {
    size: 2,
    type: "number|date"
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $subtract
});
