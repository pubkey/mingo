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
var range_exports = {};
__export(range_exports, {
  $range: () => $range
});
module.exports = __toCommonJS(range_exports);
var import_internal = require("../../../core/_internal");
var import_util = require("../../../util");
var import_internal2 = require("../_internal");
const $range = (obj, expr, options) => {
  (0, import_util.assert)(
    (0, import_util.isArray)(expr) && expr.length > 1 && expr.length < 4,
    "$range expects array(3)"
  );
  const [start, end, arg3] = (0, import_internal.evalExpr)(obj, expr, options);
  const foe = options.failOnError;
  const step = arg3 ?? 1;
  if (!(0, import_util.isInteger)(start))
    return (0, import_internal2.errExpectNumber)(foe, `$range arg1 <start>`, import_internal2.INT_OPTS.int);
  if (!(0, import_util.isInteger)(end))
    return (0, import_internal2.errExpectNumber)(foe, `$range arg2 <end>`, import_internal2.INT_OPTS.int);
  if (!(0, import_util.isInteger)(step) || step === 0)
    return (0, import_internal2.errExpectNumber)(foe, `$range arg3 <step>`, import_internal2.INT_OPTS.nzero);
  const result = new Array();
  let counter = start;
  while (counter < end && step > 0 || counter > end && step < 0) {
    result.push(counter);
    counter += step;
  }
  return result;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $range
});
