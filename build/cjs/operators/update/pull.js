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
var pull_exports = {};
__export(pull_exports, {
  $pull: () => $pull
});
module.exports = __toCommonJS(pull_exports);
var import_query = require("../../query");
var import_util = require("../../util");
var import_internal = require("./_internal");
function $pull(expr, arrayFilters = [], options = import_internal.DEFAULT_OPTIONS) {
  return (obj) => {
    return (0, import_internal.walkExpression)(expr, arrayFilters, options, (val, node, queries) => {
      const wrap = !(0, import_util.isObject)(val) || Object.keys(val).some(import_util.isOperator);
      const query = new import_query.Query(wrap ? { k: val } : val, options);
      const pred = wrap ? (v) => query.test({ k: v }) : (v) => query.test(v);
      return (0, import_internal.applyUpdate)(obj, node, queries, (o, k) => {
        const prev = o[k];
        if (!(0, import_util.isArray)(prev) || !prev.length) return false;
        const curr = new Array();
        let ok = false;
        prev.forEach((v) => {
          const b = pred(v);
          if (!b) curr.push(v);
          ok ||= b;
        });
        if (!ok) return false;
        o[k] = curr;
        return true;
      });
    });
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $pull
});
