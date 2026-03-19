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
var concat_exports = {};
__export(concat_exports, {
  $concat: () => $concat
});
module.exports = __toCommonJS(concat_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $concat = (obj, expr, options) => {
  (0, import_util.assert)((0, import_util.isArray)(expr), "$concat expects array");
  const foe = options.failOnError;
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  let ok = true;
  for (const s of args) {
    if ((0, import_util.isNil)(s)) return null;
    ok &&= (0, import_util.isString)(s);
  }
  if (!ok) return (0, import_internal2.errExpectArray)(foe, "$concat", { type: "string" });
  return args.join("");
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $concat
});
