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
var switch_exports = {};
__export(switch_exports, {
  $switch: () => $switch
});
module.exports = __toCommonJS(switch_exports);
var import_internal = require("../../../core/_internal");
var import_internal2 = require("../../../util/_internal");
const $switch = (obj, expr, options) => {
  (0, import_internal2.assert)((0, import_internal2.isObject)(expr), "$switch received invalid arguments");
  for (const { case: caseExpr, then } of expr.branches) {
    const condition = (0, import_internal2.truthy)(
      (0, import_internal.evalExpr)(obj, caseExpr, options),
      options.useStrictMode
    );
    if (condition) return (0, import_internal.evalExpr)(obj, then, options);
  }
  return (0, import_internal.evalExpr)(obj, expr.default, options);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $switch
});
