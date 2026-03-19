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
var filter_exports = {};
__export(filter_exports, {
  $filter: () => $filter
});
module.exports = __toCommonJS(filter_exports);
var import_internal = require("../../../core/_internal");
var import_internal2 = require("../../../util/_internal");
var import_internal3 = require("../_internal");
const $filter = (obj, expr, options) => {
  (0, import_internal2.assert)(
    (0, import_internal2.isObject)(expr) && (0, import_internal2.has)(expr, "input", "cond"),
    "$filter expects object { input, as, cond, limit }"
  );
  const input = (0, import_internal.evalExpr)(obj, expr.input, options);
  const foe = options.failOnError;
  if ((0, import_internal2.isNil)(input)) return null;
  if (!(0, import_internal2.isArray)(input)) return (0, import_internal3.errExpectArray)(foe, "$filter 'input'");
  const limit = expr.limit ?? Math.max(input.length, 1);
  if (!(0, import_internal2.isInteger)(limit) || limit < 1)
    return (0, import_internal3.errExpectNumber)(foe, "$filter 'limit'", { min: 1, int: true });
  if (input.length === 0) return [];
  const copts = import_internal.ComputeOptions.init(options);
  const k = expr?.as || "this";
  const locals = { variables: {} };
  const res = [];
  for (let i = 0, j = 0; i < input.length && j < limit; i++) {
    locals.variables[k] = input[i];
    const cond = (0, import_internal.evalExpr)(obj, expr.cond, copts.update(locals));
    if ((0, import_internal2.truthy)(cond, options.useStrictMode)) {
      res.push(input[i]);
      j++;
    }
  }
  return res;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $filter
});
