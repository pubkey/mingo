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
var sortArray_exports = {};
__export(sortArray_exports, {
  $sortArray: () => $sortArray
});
module.exports = __toCommonJS(sortArray_exports);
var import_internal = require("../../../core/_internal");
var import_lazy = require("../../../lazy");
var import_util = require("../../../util");
var import_sort = require("../../pipeline/sort");
var import_internal2 = require("../_internal");
const $sortArray = (obj, expr, options) => {
  (0, import_util.assert)(
    (0, import_util.isObject)(expr) && "input" in expr && "sortBy" in expr,
    "$sortArray expects object { input, sortBy }"
  );
  const { input, sortBy } = (0, import_internal.evalExpr)(obj, expr, options);
  if ((0, import_util.isNil)(input)) return null;
  if (!(0, import_util.isArray)(input))
    return (0, import_internal2.errExpectArray)(options.failOnError, "$sortArray 'input'");
  if ((0, import_util.isObject)(sortBy)) {
    return (0, import_sort.$sort)((0, import_lazy.Lazy)(input), sortBy, options).collect();
  }
  const result = input.slice().sort(import_util.compare);
  if (sortBy === -1) result.reverse();
  return result;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $sortArray
});
