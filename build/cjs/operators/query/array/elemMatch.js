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
var elemMatch_exports = {};
__export(elemMatch_exports, {
  $elemMatch: () => $elemMatch
});
module.exports = __toCommonJS(elemMatch_exports);
var import_internal = require("../../../core/_internal");
var import_query = require("../../../query");
var import_internal2 = require("../../../util/_internal");
function isNonBooleanOperator(name) {
  return (0, import_internal2.isOperator)(name) && name !== "$and" && name !== "$or" && name !== "$nor";
}
const $elemMatch = (selector, value, options) => {
  const opts = { unwrapArray: true };
  const b = value;
  let format = (x) => x;
  let criteria = b;
  if (Object.keys(b).every(isNonBooleanOperator)) {
    criteria = { temp: b };
    format = (x) => ({ temp: x });
  }
  const pathArray = selector.split(".");
  const depth = Math.max(1, pathArray.length - 1);
  const copts = import_internal.ComputeOptions.init(options).update({ depth });
  const query = new import_query.Query(criteria, copts);
  return (o) => {
    const a = (0, import_internal2.resolve)(o, selector, opts, pathArray);
    if ((0, import_internal2.isArray)(a) && !(0, import_internal2.isEmpty)(a)) {
      for (let i = 0, len = a.length; i < len; i++) {
        if (query.test(format(a[i]))) {
          return true;
        }
      }
    }
    return false;
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $elemMatch
});
