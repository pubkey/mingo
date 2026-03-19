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
var exists_exports = {};
__export(exists_exports, {
  $exists: () => $exists
});
module.exports = __toCommonJS(exists_exports);
var import_internal = require("../../../util/_internal");
const $exists = (selector, value, _options) => {
  const nested = selector.includes(".");
  const b = !!value;
  if (!nested || selector.match(/\.\d+$/)) {
    const pathArray = selector.split(".");
    return (o) => (0, import_internal.resolve)(o, selector, void 0, pathArray) !== void 0 === b;
  }
  const parentSelector = selector.substring(0, selector.lastIndexOf("."));
  const parentPathArray = parentSelector.split(".");
  return (o) => {
    const path = (0, import_internal.resolveGraph)(o, selector, {
      preserveIndex: true
    });
    const val = (0, import_internal.resolve)(path, parentSelector, void 0, parentPathArray);
    return (0, import_internal.isArray)(val) ? val.some((v) => v !== void 0) === b : val !== void 0 === b;
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $exists
});
