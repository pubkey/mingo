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
var cond_exports = {};
__export(cond_exports, {
  $cond: () => $cond
});
module.exports = __toCommonJS(cond_exports);
var import_internal = require("../../../core/_internal");
var import_internal2 = require("../../../util/_internal");
const err = "$cond expects array(3) or object with 'if-then-else' expressions";
const $cond = (obj, expr, options) => {
  let ifExpr;
  let thenExpr;
  let elseExpr;
  if ((0, import_internal2.isArray)(expr)) {
    (0, import_internal2.assert)(expr.length === 3, err);
    ifExpr = expr[0];
    thenExpr = expr[1];
    elseExpr = expr[2];
  } else {
    (0, import_internal2.assert)((0, import_internal2.isObject)(expr), err);
    ifExpr = expr.if;
    thenExpr = expr.then;
    elseExpr = expr.else;
  }
  const condition = (0, import_internal2.truthy)(
    (0, import_internal.evalExpr)(obj, ifExpr, options),
    options.useStrictMode
  );
  return (0, import_internal.evalExpr)(obj, condition ? thenExpr : elseExpr, options);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $cond
});
