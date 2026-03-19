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
var push_exports = {};
__export(push_exports, {
  $push: () => $push
});
module.exports = __toCommonJS(push_exports);
var import_internal = require("../../core/_internal");
var import_util = require("../../util");
const $push = (coll, expr, options) => {
  if ((0, import_util.isNil)(expr)) return coll;
  const copts = import_internal.ComputeOptions.init(options);
  const result = new Array(coll.length);
  for (let i = 0; i < coll.length; i++) {
    const root = coll[i];
    result[i] = (0, import_internal.evalExpr)(root, expr, copts.update({ root })) ?? null;
  }
  return result;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $push
});
