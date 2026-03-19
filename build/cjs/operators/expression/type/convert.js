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
var convert_exports = {};
__export(convert_exports, {
  $convert: () => $convert
});
module.exports = __toCommonJS(convert_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
var import_toBool = require("./toBool");
var import_toDate = require("./toDate");
var import_toDouble = require("./toDouble");
var import_toInt = require("./toInt");
var import_toLong = require("./toLong");
var import_toString = require("./toString");
const $convert = (obj, expr, options) => {
  (0, import_util.assert)(
    (0, import_util.isObject)(expr) && (0, import_util.has)(expr, "input", "to"),
    "$convert expects object { input, to, onError, onNull }"
  );
  const input = (0, import_internal.evalExpr)(obj, expr.input, options);
  if ((0, import_util.isNil)(input)) return (0, import_internal.evalExpr)(obj, expr.onNull, options) ?? null;
  const toExpr = (0, import_internal.evalExpr)(obj, expr.to, options);
  try {
    switch (toExpr) {
      case 2:
      case "string":
        return (0, import_toString.$toString)(obj, input, options);
      case 8:
      case "boolean":
      case "bool":
        return (0, import_toBool.$toBool)(obj, input, options);
      case 9:
      case "date":
        return (0, import_toDate.$toDate)(obj, input, options);
      case 1:
      case 19:
      case "double":
      case "decimal":
      case "number":
        return (0, import_toDouble.$toDouble)(obj, input, options);
      case 16:
      case "int":
        return (0, import_toInt.$toInt)(obj, input, options);
      case 18:
      case "long":
        return (0, import_toLong.$toLong)(obj, input, options);
    }
  } catch {
  }
  if (expr.onError === void 0)
    return (0, import_internal2.errInvalidArgs)(
      options.failOnError,
      `$convert cannot convert from object to ${expr.to} with no onError value`
    );
  return (0, import_internal.evalExpr)(obj, expr.onError, options);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $convert
});
