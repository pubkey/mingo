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
var substrBytes_exports = {};
__export(substrBytes_exports, {
  $substrBytes: () => $substrBytes
});
module.exports = __toCommonJS(substrBytes_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const OP = "$substrBytes";
const $substrBytes = (obj, expr, options) => {
  (0, import_util.assert)((0, import_util.isArray)(expr) && expr.length === 3, `${OP} expects array(3)`);
  const [s, index, count] = (0, import_internal.evalExpr)(obj, expr, options);
  const foe = options.failOnError;
  const nil = (0, import_util.isNil)(s);
  if (!nil && !(0, import_util.isString)(s)) return (0, import_internal2.errExpectString)(foe, `${OP} arg1 <string>`);
  if (!(0, import_util.isInteger)(index) || index < 0)
    return (0, import_internal2.errExpectNumber)(foe, `${OP} arg2 <index>`, import_internal2.INT_OPTS.index);
  if (!(0, import_util.isInteger)(count) || count < 0)
    return (0, import_internal2.errExpectNumber)(foe, `${OP} arg3 <count>`, import_internal2.INT_OPTS.index);
  if (nil) return "";
  let utf8Pos = 0;
  let start16 = null;
  let end16 = null;
  const err = `${OP} UTF-8 boundary falls inside a continuation byte`;
  for (let i = 0; i < s.length; ) {
    const cp = s.codePointAt(i);
    if (cp === void 0)
      return (0, import_internal2.errInvalidArgs)(foe, `${OP} byte index out of range`);
    const utf8Len = cp < 128 ? 1 : cp < 2048 ? 2 : cp < 65536 ? 3 : 4;
    const utf16Len = cp > 65535 ? 2 : 1;
    if (start16 === null) {
      if (index > utf8Pos && index < utf8Pos + utf8Len)
        return (0, import_internal2.errInvalidArgs)(foe, err);
      if (utf8Pos === index) {
        start16 = i;
      }
    }
    const endByte = index + count;
    if (start16 !== null && end16 === null) {
      if (endByte > utf8Pos && endByte < utf8Pos + utf8Len)
        return (0, import_internal2.errInvalidArgs)(foe, err);
      if (utf8Pos === endByte) {
        end16 = i;
        break;
      }
    }
    utf8Pos += utf8Len;
    i += utf16Len;
  }
  if (start16 === null) {
    if (index === utf8Pos) return "";
    return (0, import_internal2.errInvalidArgs)(foe, `${OP} byte index out of range`);
  }
  if (end16 === null) {
    const endByte = index + count;
    if (endByte !== utf8Pos)
      return (0, import_internal2.errInvalidArgs)(foe, `${OP} count extends beyond UTF-8 length`);
    end16 = s.length;
  }
  return s.slice(start16, end16);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $substrBytes
});
