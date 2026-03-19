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
var indexOfArray_exports = {};
__export(indexOfArray_exports, {
  $indexOfArray: () => $indexOfArray
});
module.exports = __toCommonJS(indexOfArray_exports);
var import_internal = require("../../../core/_internal");
var import_internal2 = require("../../../util/_internal");
var import_internal3 = require("../_internal");
const OP = "$indexOfArray";
const $indexOfArray = (obj, expr, options) => {
  (0, import_internal2.assert)(
    (0, import_internal2.isArray)(expr) && expr.length > 1 && expr.length < 5,
    `${OP} expects array(4)`
  );
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  const foe = options.failOnError;
  const arr = args[0];
  if ((0, import_internal2.isNil)(arr)) return null;
  if (!(0, import_internal2.isArray)(arr)) return (0, import_internal3.errExpectArray)(foe, `${OP} arg1 <array>`);
  const search = args[1];
  const start = args[2] ?? 0;
  const end = args[3] ?? arr.length;
  if (!(0, import_internal2.isInteger)(start) || start < 0)
    return (0, import_internal3.errExpectNumber)(foe, `${OP} arg3 <start>`, import_internal3.INT_OPTS.pos);
  if (!(0, import_internal2.isInteger)(end) || end < 0)
    return (0, import_internal3.errExpectNumber)(foe, `${OP} arg4 <end>`, import_internal3.INT_OPTS.pos);
  if (start > end) return -1;
  const input = start > 0 || end < arr.length ? arr.slice(start, end) : arr;
  return input.findIndex((v) => (0, import_internal2.isEqual)(v, search)) + start;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $indexOfArray
});
