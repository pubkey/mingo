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
var maxN_exports = {};
__export(maxN_exports, {
  $maxN: () => $maxN
});
module.exports = __toCommonJS(maxN_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_maxN = require("../../accumulator/maxN");
var import_internal2 = require("../_internal");
const $maxN = (obj, expr, options) => {
  (0, import_util.assert)(
    (0, import_util.isObject)(expr) && (0, import_util.has)(expr, "input", "n"),
    "$maxN expects object { input, n }"
  );
  if ((0, import_util.isArray)(obj)) return (0, import_maxN.$maxN)(obj, expr, options);
  const { input, n } = (0, import_internal.evalExpr)(obj, expr, options);
  if ((0, import_util.isNil)(input)) return null;
  if (!(0, import_util.isArray)(input))
    return (0, import_internal2.errExpectArray)(options.failOnError, "$maxN 'input'");
  return (0, import_maxN.$maxN)(input, { n, input: "$$this" }, options);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $maxN
});
