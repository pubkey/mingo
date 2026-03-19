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
var zip_exports = {};
__export(zip_exports, {
  $zip: () => $zip
});
module.exports = __toCommonJS(zip_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $zip = (obj, expr, options) => {
  (0, import_util.assert)(
    (0, import_util.isObject)(expr) && (0, import_util.has)(expr, "inputs"),
    "$zip received invalid arguments"
  );
  const inputs = (0, import_internal.evalExpr)(obj, expr.inputs, options);
  const defaults = (0, import_internal.evalExpr)(obj, expr.defaults, options) ?? [];
  const useLongestLength = expr.useLongestLength ?? false;
  const foe = options.failOnError;
  if ((0, import_util.isNil)(inputs)) return null;
  if (!(0, import_util.isArray)(inputs)) return (0, import_internal2.errExpectArray)(foe, "$zip 'inputs'");
  let invalid = 0;
  for (const elem of inputs) {
    if ((0, import_util.isNil)(elem)) return null;
    if (!(0, import_util.isArray)(elem)) invalid++;
  }
  if (invalid) return (0, import_internal2.errExpectArray)(foe, "$zip elements of 'inputs'");
  if (!(0, import_util.isBoolean)(useLongestLength))
    (0, import_internal2.errInvalidArgs)(foe, "$zip 'useLongestLength' must be boolean");
  if ((0, import_util.isArray)(defaults) && defaults.length > 0) {
    (0, import_util.assert)(
      useLongestLength && defaults.length === inputs.length,
      "$zip 'useLongestLength' must be set to true to use 'defaults'"
    );
  }
  let zipCount = 0;
  for (const arr of inputs) {
    zipCount = useLongestLength ? Math.max(zipCount, arr.length) : Math.min(zipCount || arr.length, arr.length);
  }
  const result = [];
  for (let i = 0; i < zipCount; i++) {
    const temp = inputs.map((val, index) => {
      return (0, import_util.isNil)(val[i]) ? defaults[index] ?? null : val[i];
    });
    result.push(temp);
  }
  return result;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $zip
});
