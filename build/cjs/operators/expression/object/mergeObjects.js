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
var mergeObjects_exports = {};
__export(mergeObjects_exports, {
  $mergeObjects: () => $mergeObjects
});
module.exports = __toCommonJS(mergeObjects_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_mergeObjects = require("../../accumulator/mergeObjects");
var import_internal2 = require("../_internal");
const $mergeObjects = (obj, expr, options) => {
  const docs = (0, import_internal.evalExpr)(obj, expr, options);
  if ((0, import_util.isNil)(docs)) return {};
  if (!(0, import_util.isArray)(docs))
    return (0, import_internal2.errExpectArray)(options.failOnError, "$mergeObjects", import_internal2.ARR_OPTS.obj);
  return (0, import_mergeObjects.$mergeObjects)(docs, expr, options);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $mergeObjects
});
