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
var topN_exports = {};
__export(topN_exports, {
  $topN: () => $topN
});
module.exports = __toCommonJS(topN_exports);
var import_internal = require("../../core/_internal");
var import_lazy = require("../../lazy");
var import_sort = require("../pipeline/sort");
var import_push = require("./push");
const $topN = (coll, expr, options) => {
  const copts = options;
  const { n, sortBy } = (0, import_internal.evalExpr)(copts?.local?.groupId, expr, copts);
  const result = (0, import_sort.$sort)((0, import_lazy.Lazy)(coll), sortBy, options).take(n).collect();
  return (0, import_push.$push)(result, expr.output, copts);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $topN
});
