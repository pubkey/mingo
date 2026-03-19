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
var strcasecmp_exports = {};
__export(strcasecmp_exports, {
  $strcasecmp: () => $strcasecmp
});
module.exports = __toCommonJS(strcasecmp_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../../../util/_internal");
var import_internal3 = require("../_internal");
const $strcasecmp = (obj, expr, options) => {
  (0, import_internal2.assert)((0, import_util.isArray)(expr) && expr.length === 2, `$strcasecmp expects array(2)`);
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  const foe = options.failOnError;
  if (args.every(import_util.isNil)) return 0;
  if (!args.every(import_util.isString))
    return (0, import_internal3.errExpectArray)(foe, `$strcasecmp arguments`, { type: "string" });
  const [a, b] = args.map((s) => s.toLowerCase());
  return (0, import_internal2.simpleCmp)(a, b);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $strcasecmp
});
