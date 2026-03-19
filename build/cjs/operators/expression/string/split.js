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
var split_exports = {};
__export(split_exports, {
  $split: () => $split
});
module.exports = __toCommonJS(split_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $split = (obj, expr, options) => {
  (0, import_util.assert)((0, import_util.isArray)(expr) && expr.length === 2, `$split expects array(2)`);
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  const foe = options.failOnError;
  if ((0, import_util.isNil)(args[0])) return null;
  if (!args.every(import_util.isString))
    return (0, import_internal2.errExpectArray)(foe, `$split `, { size: 2, type: "string" });
  return args[0].split(args[1]);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $split
});
