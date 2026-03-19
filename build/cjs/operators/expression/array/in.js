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
var in_exports = {};
__export(in_exports, {
  $in: () => $in
});
module.exports = __toCommonJS(in_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $in = (obj, expr, options) => {
  (0, import_util.assert)((0, import_util.isArray)(expr) && expr.length === 2, "$in expects array(2)");
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  const [item, arr] = args;
  if (!(0, import_util.isArray)(arr))
    return (0, import_internal2.errInvalidArgs)(options.failOnError, "$in arg2 <array>");
  return arr.some((v) => (0, import_util.isEqual)(v, item));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $in
});
