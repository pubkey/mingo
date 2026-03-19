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
var arrayToObject_exports = {};
__export(arrayToObject_exports, {
  $arrayToObject: () => $arrayToObject
});
module.exports = __toCommonJS(arrayToObject_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const ERR_OPTS = {
  generic: { type: "key-value pairs" },
  array: { type: "[k,v]" },
  object: { type: "{k,v}" }
};
const $arrayToObject = (obj, expr, options) => {
  const foe = options.failOnError;
  const arr = (0, import_internal.evalExpr)(obj, expr, options);
  if ((0, import_util.isNil)(arr)) return null;
  if (!(0, import_util.isArray)(arr))
    return (0, import_internal2.errExpectArray)(foe, "$arrayToObject", ERR_OPTS.generic);
  let tag = 0;
  const newObj = {};
  for (const item of arr) {
    if ((0, import_util.isArray)(item)) {
      const val = (0, import_util.flatten)(item);
      if (!tag) tag = 1;
      if (tag !== 1) {
        return (0, import_internal2.errExpectArray)(foe, "$arrayToObject", ERR_OPTS.object);
      }
      const [k, v] = val;
      newObj[k] = v;
    } else if ((0, import_util.isObject)(item) && (0, import_util.has)(item, "k", "v")) {
      if (!tag) tag = 2;
      if (tag !== 2) {
        return (0, import_internal2.errExpectArray)(foe, "$arrayToObject", ERR_OPTS.array);
      }
      const { k, v } = item;
      newObj[k] = v;
    } else {
      return (0, import_internal2.errExpectArray)(foe, "$arrayToObject", ERR_OPTS.generic);
    }
  }
  return newObj;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $arrayToObject
});
