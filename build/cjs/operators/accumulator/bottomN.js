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
var bottomN_exports = {};
__export(bottomN_exports, {
  $bottomN: () => $bottomN
});
module.exports = __toCommonJS(bottomN_exports);
var import_internal = require("../../core/_internal");
var import_lazy = require("../../lazy");
var import_sort = require("../pipeline/sort");
var import_push = require("./push");
const $bottomN = (coll, expr, options) => {
  const copts = options;
  const args = expr;
  const n = (0, import_internal.evalExpr)(copts?.local?.groupId, args.n, copts);
  const result = (0, import_sort.$sort)((0, import_lazy.Lazy)(coll), args.sortBy, options).collect();
  const m = result.length;
  return (0, import_push.$push)(m <= n ? result : result.slice(m - n), args.output, copts);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $bottomN
});
