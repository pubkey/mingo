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
  ARR_OPTS: () => ARR_OPTS,
  INT_OPTS: () => INT_OPTS,
  errExpectArray: () => errExpectArray,
  errExpectNumber: () => errExpectNumber,
  errExpectObject: () => errExpectObject,
  errExpectString: () => errExpectString,
  errInvalidArgs: () => errInvalidArgs
});
module.exports = __toCommonJS(internal_exports);
var import_util = require("../../util");
const INT_OPTS = {
  int: { int: true },
  // (-∞, ∞)
  pos: { min: 1, int: true },
  // [1, ∞]
  index: { min: 0, int: true },
  // [0, ∞]
  nzero: { min: 0, max: 0, int: true }
  // non-zero
};
const ARR_OPTS = {
  int: { type: "integers" },
  obj: { type: "objects" }
};
function errInvalidArgs(failOnError, message) {
  (0, import_util.assert)(!failOnError, message);
  return null;
}
function errExpectObject(failOnError, prefix) {
  const msg = `${prefix} expression must resolve to object`;
  (0, import_util.assert)(!failOnError, msg);
  return null;
}
function errExpectString(failOnError, prefix) {
  const msg = `${prefix} expression must resolve to string`;
  (0, import_util.assert)(!failOnError, msg);
  return null;
}
function errExpectNumber(failOnError, name, opts) {
  const type = opts?.int ? "integer" : "number";
  const min = opts?.min ?? -Infinity;
  const max = opts?.max ?? Infinity;
  let msg;
  if (min === 0 && max === 0) {
    msg = `${name} expression must resolve to non-zero ${type}`;
  } else if (min === 0 && max === Infinity) {
    msg = `${name} expression must resolve to non-negative ${type}`;
  } else if (min !== -Infinity && max !== Infinity) {
    msg = `${name} expression must resolve to ${type} in range [${min}, ${max}]`;
  } else if (min > 0) {
    msg = `${name} expression must resolve to positive ${type}`;
  } else {
    msg = `${name} expression must resolve to ${type}`;
  }
  (0, import_util.assert)(!failOnError, msg);
  return null;
}
function errExpectArray(failOnError, prefix, opts) {
  let suffix = "array";
  if (!(0, import_util.isNil)(opts?.size) && opts?.size >= 0)
    suffix = opts.size === 0 ? "non-zero array" : `array(${opts.size})`;
  if (opts?.type) suffix = `array of ${opts.type}`;
  const msg = `${prefix} expression must resolve to ${suffix}`;
  (0, import_util.assert)(!failOnError, msg);
  return null;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ARR_OPTS,
  INT_OPTS,
  errExpectArray,
  errExpectNumber,
  errExpectObject,
  errExpectString,
  errInvalidArgs
});
