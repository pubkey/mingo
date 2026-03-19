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
var redact_exports = {};
__export(redact_exports, {
  $redact: () => $redact
});
module.exports = __toCommonJS(redact_exports);
var import_internal = require("../../core/_internal");
var import_util = require("../../util");
function $redact(coll, expr, options) {
  const copts = import_internal.ComputeOptions.init(options);
  return coll.map(
    (root) => redact(root, expr, copts.update({ root }))
  );
}
function redact(obj, expr, options) {
  const action = (0, import_internal.evalExpr)(obj, expr, options);
  switch (action) {
    case "$$KEEP":
      return obj;
    case "$$PRUNE":
      return void 0;
    case "$$DESCEND": {
      if (!(0, import_util.has)(expr, "$cond")) return obj;
      const output = {};
      for (const [key, value] of Object.entries(obj)) {
        if ((0, import_util.isArray)(value)) {
          const res = new Array();
          for (let elem of value) {
            if ((0, import_util.isObject)(elem)) {
              elem = redact(elem, expr, options.update({ root: elem }));
            }
            if (!(0, import_util.isNil)(elem)) res.push(elem);
          }
          output[key] = res;
        } else if ((0, import_util.isObject)(value)) {
          const res = redact(
            value,
            expr,
            options.update({ root: value })
          );
          if (!(0, import_util.isNil)(res)) output[key] = res;
        } else {
          output[key] = value;
        }
      }
      return output;
    }
    default:
      return action;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $redact
});
