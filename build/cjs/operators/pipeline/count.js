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
var count_exports = {};
__export(count_exports, {
  $count: () => $count
});
module.exports = __toCommonJS(count_exports);
var import_lazy = require("../../lazy");
var import_util = require("../../util");
function $count(coll, expr, _options) {
  (0, import_util.assert)(
    (0, import_util.isString)(expr) && expr.trim().length > 0 && !expr.includes(".") && expr[0] !== "$",
    "$count expression must evaluate to valid field name"
  );
  let i = 0;
  return (0, import_lazy.Lazy)(() => {
    if (i++ == 0) return { value: { [expr]: coll.size() }, done: false };
    return { done: true };
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $count
});
