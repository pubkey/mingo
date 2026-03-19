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
var add_exports = {};
__export(add_exports, {
  $add: () => $add
});
module.exports = __toCommonJS(add_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const err = "$add expression must resolve to array of numbers.";
const $add = (obj, expr, options) => {
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  const failOnError = options.failOnError;
  let dateFound = false;
  let result = 0;
  if (!(0, import_util.isArray)(args)) return (0, import_internal2.errInvalidArgs)(failOnError, err);
  for (const n of args) {
    if ((0, import_util.isNil)(n)) return null;
    if (typeof n === "number") {
      result += n;
    } else if ((0, import_util.isDate)(n)) {
      if (dateFound) {
        return (0, import_internal2.errInvalidArgs)(failOnError, "$add must only have one date");
      }
      dateFound = true;
      result += +n;
    } else {
      return (0, import_internal2.errInvalidArgs)(failOnError, err);
    }
  }
  return dateFound ? new Date(result) : result;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $add
});
