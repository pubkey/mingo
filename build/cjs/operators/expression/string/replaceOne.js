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
var replaceOne_exports = {};
__export(replaceOne_exports, {
  $replaceOne: () => $replaceOne
});
module.exports = __toCommonJS(replaceOne_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const OP = "$replaceOne";
const $replaceOne = (obj, expr, options) => {
  const foe = options.failOnError;
  const args = (0, import_internal.evalExpr)(obj, expr, options);
  const { input, find, replacement } = args;
  if ((0, import_util.isNil)(input) || (0, import_util.isNil)(find) || (0, import_util.isNil)(replacement)) return null;
  if (!(0, import_util.isString)(input)) return (0, import_internal2.errExpectString)(foe, `${OP} 'input'`);
  if (!(0, import_util.isString)(find)) return (0, import_internal2.errExpectString)(foe, `${OP} 'find'`);
  if (!(0, import_util.isString)(replacement))
    return (0, import_internal2.errExpectString)(foe, `${OP} 'replacement'`);
  return args.input.replace(args.find, args.replacement);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $replaceOne
});
