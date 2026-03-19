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
var substrCP_exports = {};
__export(substrCP_exports, {
  $substrCP: () => $substrCP
});
module.exports = __toCommonJS(substrCP_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const OP = "$substrCP";
const $substrCP = (obj, expr, options) => {
  (0, import_util.assert)((0, import_util.isArray)(expr) && expr.length === 3, `${OP} expects array(3)`);
  const [s, index, count] = (0, import_internal.evalExpr)(obj, expr, options);
  const nil = (0, import_util.isNil)(s);
  const foe = options.failOnError;
  if (!nil && !(0, import_util.isString)(s)) return (0, import_internal2.errExpectString)(foe, `${OP} arg1 <string>`);
  if (!(0, import_util.isInteger)(index)) return (0, import_internal2.errExpectNumber)(foe, `${OP} arg2 <index>`);
  if (!(0, import_util.isInteger)(count)) return (0, import_internal2.errExpectNumber)(foe, `${OP} arg3 <count>`);
  if (nil) return "";
  if (index < 0) return "";
  if (count < 0) return s.substring(index);
  return s.substring(index, index + count);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $substrCP
});
