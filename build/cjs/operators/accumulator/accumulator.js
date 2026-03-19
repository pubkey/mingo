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
var accumulator_exports = {};
__export(accumulator_exports, {
  $accumulator: () => $accumulator
});
module.exports = __toCommonJS(accumulator_exports);
var import_internal = require("../../core/_internal");
var import_util = require("../../util");
var import_push = require("./push");
const $accumulator = (coll, expr, options) => {
  (0, import_util.assert)(
    options.scriptEnabled,
    "$accumulator requires 'scriptEnabled' option to be true"
  );
  const copts = import_internal.ComputeOptions.init(options);
  const input = expr;
  const initArgs = (0, import_internal.evalExpr)(
    copts?.local?.groupId,
    input.initArgs || [],
    copts.update({ root: copts?.local?.groupId })
  );
  const args = (0, import_push.$push)(coll, input.accumulateArgs, copts);
  for (let i = 0; i < args.length; i++) {
    for (let j = 0; j < args[i].length; j++) {
      args[i][j] = args[i][j] ?? null;
    }
  }
  const initialValue = input.init.apply(null, initArgs);
  const f = input.accumulate;
  let result = initialValue;
  for (let i = 0; i < args.length; i++) {
    result = f.apply(null, [result, ...args[i]]);
  }
  if (input.finalize) result = input.finalize.call(null, result);
  return result;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $accumulator
});
