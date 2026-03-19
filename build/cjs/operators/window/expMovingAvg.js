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
var expMovingAvg_exports = {};
__export(expMovingAvg_exports, {
  $expMovingAvg: () => $expMovingAvg
});
module.exports = __toCommonJS(expMovingAvg_exports);
var import_util = require("../../util");
var import_push = require("../accumulator/push");
var import_internal = require("./_internal");
const $expMovingAvg = (_, coll, expr, options) => {
  const { input, N, alpha } = expr.inputExpr;
  (0, import_util.assert)(
    !(N && alpha),
    `$expMovingAvg: must provide either 'N' or 'alpha' field.`
  );
  (0, import_util.assert)(
    !N || (0, import_util.isNumber)(N) && N > 0,
    `$expMovingAvg: 'N' must be greater than zero. Got ${N}.`
  );
  (0, import_util.assert)(
    !alpha || (0, import_util.isNumber)(alpha) && alpha > 0 && alpha < 1,
    `$expMovingAvg: 'alpha' must be between 0 and 1 (exclusive), found alpha: ${alpha}`
  );
  return (0, import_internal.withMemo)(
    coll,
    expr,
    () => {
      const weight = N != void 0 ? 2 / (N + 1) : alpha;
      const values = (0, import_push.$push)(coll, input, options);
      for (let i = 0; i < values.length; i++) {
        if (i === 0) {
          if (!(0, import_util.isNumber)(values[i])) values[i] = null;
          continue;
        }
        if (!(0, import_util.isNumber)(values[i])) {
          values[i] = values[i - 1];
          continue;
        }
        if (!(0, import_util.isNumber)(values[i - 1])) continue;
        values[i] = values[i] * weight + values[i - 1] * (1 - weight);
      }
      return values;
    },
    (series) => series[expr.documentNumber - 1]
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $expMovingAvg
});
