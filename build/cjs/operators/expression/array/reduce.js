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
var reduce_exports = {};
__export(reduce_exports, {
  $reduce: () => $reduce
});
module.exports = __toCommonJS(reduce_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
function $reduce(obj, expr, options) {
  (0, import_util.assert)(
    (0, import_util.isObject)(expr) && (0, import_util.has)(expr, "input", "initialValue", "in"),
    "$reduce expects object { input, initialValue, in }"
  );
  const input = (0, import_internal.evalExpr)(obj, expr.input, options);
  const initialValue = (0, import_internal.evalExpr)(obj, expr.initialValue, options);
  const inExpr = expr["in"];
  if ((0, import_util.isNil)(input)) return null;
  if (!(0, import_util.isArray)(input))
    return (0, import_internal2.errExpectArray)(options.failOnError, "$reduce 'input'");
  const copts = import_internal.ComputeOptions.init(options);
  const locals = { variables: { value: null } };
  let result = initialValue;
  for (let i = 0; i < input.length; i++) {
    locals.variables.value = result;
    result = (0, import_internal.evalExpr)(input[i], inExpr, copts.update(locals));
  }
  return result;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $reduce
});
