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
var percentile_exports = {};
__export(percentile_exports, {
  $percentile: () => $percentile
});
module.exports = __toCommonJS(percentile_exports);
var import_util = require("../../util");
var import_internal = require("../expression/_internal");
var import_push = require("./push");
const $percentile = (coll, expr, options) => {
  (0, import_util.assert)(
    (0, import_util.isObject)(expr) && (0, import_util.has)(expr, "input", "p") && (0, import_util.isArray)(expr.p),
    "$percentile expects object { input, p }"
  );
  const X = (0, import_push.$push)(coll, expr.input, options).filter(import_util.isNumber).sort();
  const centiles = (0, import_push.$push)(expr.p, "$$CURRENT", options);
  const method = expr.method || "approximate";
  for (const n of centiles) {
    if (!(0, import_util.isNumber)(n) || n < 0 || n > 1) {
      return (0, import_internal.errInvalidArgs)(
        options.failOnError,
        "$percentile 'p' must resolve to array of numbers between [0.0, 1.0]"
      );
    }
  }
  return centiles.map((p) => {
    const r = p * (X.length - 1) + 1;
    const ri = Math.floor(r);
    const result = r === ri ? X[r - 1] : X[ri - 1] + r % 1 * (X[ri] - X[ri - 1]);
    switch (method) {
      case "exact":
        return result;
      case "approximate": {
        const i = (0, import_util.findInsertIndex)(X, result);
        return i / X.length >= p ? X[Math.max(i - 1, 0)] : X[i];
      }
    }
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $percentile
});
