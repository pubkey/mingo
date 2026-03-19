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
var setIsSubset_exports = {};
__export(setIsSubset_exports, {
  $setIsSubset: () => $setIsSubset
});
module.exports = __toCommonJS(setIsSubset_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const OP = "$setIsSubset";
const $setIsSubset = (obj, expr, options) => {
  (0, import_util.assert)((0, import_util.isArray)(expr) && expr.length === 2, `${OP} expects array(2)`);
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  if (!args.every(import_util.isArray))
    return (0, import_internal2.errExpectArray)(options.failOnError, `${OP} arguments`);
  const [first, second] = args;
  const map = import_util.HashMap.init();
  const set = /* @__PURE__ */ new Set();
  first.every((v, i) => map.set(v, i));
  for (const v of second) {
    set.add(map.get(v) ?? -1);
    if (set.size > map.size) return true;
  }
  set.delete(-1);
  return set.size == map.size;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $setIsSubset
});
