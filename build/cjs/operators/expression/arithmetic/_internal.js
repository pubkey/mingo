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
var internal_exports = {};
__export(internal_exports, {
  truncate: () => truncate
});
module.exports = __toCommonJS(internal_exports);
var import_util = require("../../../util");
var import_internal = require("../_internal");
function truncate(num, precision, opts) {
  const { name, roundOff, failOnError } = opts;
  if ((0, import_util.isNil)(num)) return null;
  if (Number.isNaN(num) || Math.abs(num) === Infinity) return num;
  if (!(0, import_util.isNumber)(num)) {
    return (0, import_internal.errExpectNumber)(failOnError, `${name} arg1 <number>`);
  }
  if (!(0, import_util.isInteger)(precision) || precision < -20 || precision > 100) {
    return (0, import_internal.errExpectNumber)(failOnError, `${name} arg2 <precision>`, {
      min: -20,
      max: 100,
      int: true
    });
  }
  const sign = Math.abs(num) === num ? 1 : -1;
  num = Math.abs(num);
  let result = Math.trunc(num);
  const decimals = parseFloat((num - result).toFixed(Math.abs(precision) + 1));
  if (precision === 0) {
    const firstDigit = Math.trunc(10 * decimals);
    if (roundOff && ((result & 1) === 1 && firstDigit >= 5 || firstDigit > 5)) {
      result++;
    }
  } else if (precision > 0) {
    const offset = Math.pow(10, precision);
    let remainder = Math.trunc(decimals * offset);
    const lastDigit = Math.trunc(decimals * offset * 10) % 10;
    if (roundOff && lastDigit > 5) {
      remainder += 1;
    }
    result = (result * offset + remainder) / offset;
  } else if (precision < 0) {
    const offset = Math.pow(10, -1 * precision);
    let excess = result % offset;
    result = Math.max(0, result - excess);
    if (roundOff && sign === -1) {
      while (excess > 10) {
        excess -= excess / 10;
      }
      if (result > 0 && excess >= 5) {
        result += offset;
      }
    }
  }
  return result * sign;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  truncate
});
