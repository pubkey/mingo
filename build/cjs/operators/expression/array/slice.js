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
var slice_exports = {};
__export(slice_exports, {
  $slice: () => $slice
});
module.exports = __toCommonJS(slice_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $slice = (obj, expr, options) => {
  (0, import_util.assert)(
    (0, import_util.isArray)(expr) && expr.length > 1 && expr.length < 4,
    "$slice expects array(3)"
  );
  const foe = options.failOnError;
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  const arr = args[0];
  let skip = args[1];
  let limit = args[2];
  if (!(0, import_util.isArray)(arr)) return (0, import_internal2.errExpectArray)(foe, "$slice arg1 <array>");
  if (!(0, import_util.isInteger)(skip))
    return (0, import_internal2.errExpectNumber)(foe, "$slice arg2 <n>", import_internal2.INT_OPTS.int);
  if (!(0, import_util.isNil)(limit) && !(0, import_util.isInteger)(limit))
    return (0, import_internal2.errExpectNumber)(foe, "$slice arg3 <n>", import_internal2.INT_OPTS.int);
  if ((0, import_util.isNil)(limit)) {
    if (skip < 0) {
      skip = Math.max(0, arr.length + skip);
    } else {
      limit = skip;
      skip = 0;
    }
  } else {
    if (skip < 0) {
      skip = Math.max(0, arr.length + skip);
    }
    if (limit < 1) {
      return (0, import_internal2.errExpectNumber)(foe, "$slice arg3 <n>", import_internal2.INT_OPTS.pos);
    }
    limit += skip;
  }
  return arr.slice(skip, limit);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $slice
});
