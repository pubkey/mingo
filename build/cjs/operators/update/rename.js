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
var rename_exports = {};
__export(rename_exports, {
  $rename: () => $rename
});
module.exports = __toCommonJS(rename_exports);
var import_util = require("../../util");
var import_internal = require("./_internal");
var import_set = require("./set");
const isIdPath = (path, idKey) => path === idKey || path.startsWith(`${idKey}.`);
function $rename(expr, arrayFilters = [], options = import_internal.DEFAULT_OPTIONS) {
  const idKey = options.idKey;
  for (const target of Object.values(expr)) {
    (0, import_util.assert)(
      !isIdPath(target, idKey),
      `Performing an update on the path '${target}' would modify the immutable field '${idKey}'.`
    );
  }
  return (obj) => {
    const res = [];
    const changed = (0, import_internal.walkExpression)(
      expr,
      arrayFilters,
      options,
      (val, node, queries) => {
        return (0, import_internal.applyUpdate)(obj, node, queries, (o, k) => {
          if (!(0, import_util.has)(o, k)) return false;
          Array.prototype.push.apply(
            res,
            (0, import_set.$set)({ [val]: o[k] }, arrayFilters, options)(obj)
          );
          delete o[k];
          return true;
        });
      }
    );
    return Array.from(new Set(changed.concat(res)));
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $rename
});
