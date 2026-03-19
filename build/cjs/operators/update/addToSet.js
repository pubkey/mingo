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
var addToSet_exports = {};
__export(addToSet_exports, {
  $addToSet: () => $addToSet
});
module.exports = __toCommonJS(addToSet_exports);
var import_util = require("../../util");
var import_internal = require("./_internal");
function $addToSet(expr, arrayFilters = [], options = import_internal.DEFAULT_OPTIONS) {
  return (obj) => {
    return (0, import_internal.walkExpression)(expr, arrayFilters, options, (val, node, queries) => {
      const args = { $each: [val] };
      if ((0, import_util.isObject)(val) && (0, import_util.has)(val, "$each")) {
        Object.assign(args, val);
      }
      return (0, import_internal.applyUpdate)(
        obj,
        node,
        queries,
        (o, k) => {
          const prev = o[k];
          if ((0, import_util.isArray)(prev)) {
            const set = (0, import_util.unique)(prev.concat(args.$each));
            if (set.length === prev.length) return false;
            o[k] = (0, import_internal.clone)(set, options);
          } else if (prev === void 0) {
            o[k] = (0, import_internal.clone)(args.$each, options);
          } else {
            return false;
          }
          return true;
        },
        { buildGraph: true }
      );
    });
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $addToSet
});
