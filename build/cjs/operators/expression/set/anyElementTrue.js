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
var anyElementTrue_exports = {};
__export(anyElementTrue_exports, {
  $anyElementTrue: () => $anyElementTrue
});
module.exports = __toCommonJS(anyElementTrue_exports);
var import_internal = require("../../../core/_internal");
var import_internal2 = require("../../../util/_internal");
var import_internal3 = require("../_internal");
const $anyElementTrue = (obj, expr, options) => {
  if ((0, import_internal2.isArray)(expr)) {
    if (expr.length === 0) return false;
    (0, import_internal2.assert)(expr.length === 1, "$anyElementTrue expects array(1)");
    expr = expr[0];
  }
  const foe = options.failOnError;
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  if (!(0, import_internal2.isArray)(args)) return (0, import_internal3.errExpectArray)(foe, `$anyElementTrue argument`);
  return args.some((v) => (0, import_internal2.truthy)(v, options.useStrictMode));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $anyElementTrue
});
