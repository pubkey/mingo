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
var group_exports = {};
__export(group_exports, {
  $group: () => $group
});
module.exports = __toCommonJS(group_exports);
var import_internal = require("../../core/_internal");
var import_lazy = require("../../lazy");
var import_util = require("../../util");
const ID_KEY = "_id";
function $group(coll, expr, options) {
  (0, import_util.assert)((0, import_util.has)(expr, ID_KEY), "$group specification must include an '_id'");
  const idExpr = expr[ID_KEY];
  const copts = import_internal.ComputeOptions.init(options);
  const newFields = Object.keys(expr).filter((k) => k != ID_KEY);
  return coll.transform((coll2) => {
    const partitions = (0, import_util.groupBy)(coll2, (obj) => (0, import_internal.evalExpr)(obj, idExpr, options));
    let i = -1;
    const partitionKeys = Array.from(partitions.keys());
    return (0, import_lazy.Lazy)(() => {
      if (++i === partitions.size) return { done: true };
      const groupId = partitionKeys[i];
      const obj = {};
      if (groupId !== void 0) {
        obj[ID_KEY] = groupId;
      }
      for (const key of newFields) {
        obj[key] = (0, import_internal.evalExpr)(
          partitions.get(groupId),
          expr[key],
          copts.update({ root: null, groupId })
        );
      }
      return { value: obj, done: false };
    });
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $group
});
