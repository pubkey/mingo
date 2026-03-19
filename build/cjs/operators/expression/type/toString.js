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
var toString_exports = {};
__export(toString_exports, {
  $toString: () => $toString
});
module.exports = __toCommonJS(toString_exports);
var import_internal = require("../../../core/_internal");
var import_internal2 = require("../../../util/_internal");
var import_internal3 = require("../_internal");
const $toString = (obj, expr, options) => {
  const val = (0, import_internal.evalExpr)(obj, expr, options);
  if ((0, import_internal2.isNil)(val)) return null;
  if ((0, import_internal2.isDate)(val)) return val.toISOString();
  if ((0, import_internal2.isPrimitive)(val) || (0, import_internal2.isRegExp)(val)) return String(val);
  return (0, import_internal3.errInvalidArgs)(
    options.failOnError,
    "$toString cannot convert from object to string"
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $toString
});
