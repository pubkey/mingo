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
var setField_exports = {};
__export(setField_exports, {
  $setField: () => $setField
});
module.exports = __toCommonJS(setField_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const OP = "$setField";
const $setField = (obj, expr, options) => {
  (0, import_util.assert)(
    (0, import_util.isObject)(expr) && (0, import_util.has)(expr, "input", "field", "value"),
    "$setField expects object { input, field, value }"
  );
  const { input, field, value } = (0, import_internal.evalExpr)(obj, expr, options);
  if ((0, import_util.isNil)(input)) return null;
  const foe = options.failOnError;
  if (!(0, import_util.isObject)(input)) return (0, import_internal2.errExpectObject)(foe, `${OP} 'input'`);
  if (!(0, import_util.isString)(field)) return (0, import_internal2.errExpectString)(foe, `${OP} 'field'`);
  const newObj = { ...input };
  if (expr.value == "$$REMOVE") {
    delete newObj[field];
  } else {
    newObj[field] = value;
  }
  return newObj;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $setField
});
