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
var minN_exports = {};
__export(minN_exports, {
  $minN: () => $minN
});
module.exports = __toCommonJS(minN_exports);
var import_internal = require("../../core/_internal");
var import_util = require("../../util");
var import_internal2 = require("../expression/_internal");
var import_push = require("./push");
const $minN = (coll, expr, options) => {
  const copts = options;
  const m = coll.length;
  const n = (0, import_internal.evalExpr)(copts?.local?.groupId, expr.n, copts);
  if (!(0, import_util.isInteger)(n) || n < 1) {
    return (0, import_internal2.errExpectNumber)(options.failOnError, "$minN 'n'", import_internal2.INT_OPTS.pos);
  }
  const arr = (0, import_push.$push)(coll, expr.input, options).filter((o) => !(0, import_util.isNil)(o));
  arr.sort(import_util.compare);
  return m <= n ? arr : arr.slice(0, n);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $minN
});
