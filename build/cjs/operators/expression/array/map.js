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
var map_exports = {};
__export(map_exports, {
  $map: () => $map
});
module.exports = __toCommonJS(map_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $map = (obj, expr, options) => {
  (0, import_util.assert)(
    (0, import_util.isObject)(expr) && (0, import_util.has)(expr, "input", "in"),
    "$map expects object { input, as, in }"
  );
  const input = (0, import_internal.evalExpr)(obj, expr.input, options);
  const foe = options.failOnError;
  if ((0, import_util.isNil)(input)) return null;
  if (!(0, import_util.isArray)(input)) return (0, import_internal2.errExpectArray)(foe, "$map 'input'");
  if (!(0, import_util.isNil)(expr.as) && !(0, import_util.isString)(expr.as))
    return (0, import_internal2.errExpectString)(foe, "$map 'as'");
  const copts = import_internal.ComputeOptions.init(options);
  const k = expr.as || "this";
  const locals = { variables: {} };
  return input.map((o) => {
    locals.variables[k] = o;
    return (0, import_internal.evalExpr)(obj, expr.in, copts.update(locals));
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $map
});
