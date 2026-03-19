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
var indexOfBytes_exports = {};
__export(indexOfBytes_exports, {
  $indexOfBytes: () => $indexOfBytes
});
module.exports = __toCommonJS(indexOfBytes_exports);
var import_internal = require("../../../core/_internal");
var import_internal2 = require("../../../util/_internal");
var import_internal3 = require("../_internal");
const OP = "$indexOfBytes";
const $indexOfBytes = (obj, expr, options) => {
  (0, import_internal2.assert)(
    (0, import_internal2.isArray)(expr) && expr.length > 1 && expr.length < 5,
    `${OP} expects array(4)`
  );
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  const foe = options.failOnError;
  const str = args[0];
  if ((0, import_internal2.isNil)(str)) return null;
  if (!(0, import_internal2.isString)(str)) return (0, import_internal3.errExpectString)(foe, `${OP} arg1 <string>`);
  const search = args[1];
  if (!(0, import_internal2.isString)(search)) return (0, import_internal3.errExpectString)(foe, `${OP} arg2 <search>`);
  const start = args[2] ?? 0;
  const end = args[3] ?? str.length;
  if (!(0, import_internal2.isInteger)(start) || start < 0)
    return (0, import_internal3.errExpectNumber)(foe, `${OP} arg3 <start>`, import_internal3.INT_OPTS.index);
  if (!(0, import_internal2.isInteger)(end) || end < 0)
    return (0, import_internal3.errExpectNumber)(foe, `${OP} arg4 <end>`, import_internal3.INT_OPTS.index);
  if (start > end) return -1;
  const index = str.substring(start, end).indexOf(search);
  return index > -1 ? index + start : index;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $indexOfBytes
});
