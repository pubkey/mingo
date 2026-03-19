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
var arrayElemAt_exports = {};
__export(arrayElemAt_exports, {
  $arrayElemAt: () => $arrayElemAt
});
module.exports = __toCommonJS(arrayElemAt_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const OP = "$arrayElemAt";
const $arrayElemAt = (obj, expr, options) => {
  (0, import_util.assert)((0, import_util.isArray)(expr) && expr.length === 2, `${OP} expects array(2)`);
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  if (args.some(import_util.isNil)) return null;
  const foe = options.failOnError;
  const [arr, index] = args;
  if (!(0, import_util.isArray)(arr)) return (0, import_internal2.errExpectArray)(foe, `${OP} arg1 <array>`);
  if (!(0, import_util.isInteger)(index))
    return (0, import_internal2.errExpectNumber)(foe, `${OP} arg2 <index>`, import_internal2.INT_OPTS.int);
  if (index < 0 && Math.abs(index) <= arr.length) {
    return arr[(index + arr.length) % arr.length];
  } else if (index >= 0 && index < arr.length) {
    return arr[index];
  }
  return void 0;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $arrayElemAt
});
