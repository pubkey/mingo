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
var util_exports = {};
__export(util_exports, {
  HashMap: () => import_internal.HashMap,
  MingoError: () => import_internal.MingoError,
  assert: () => import_internal.assert,
  cloneDeep: () => import_internal.cloneDeep,
  compare: () => import_internal.compare,
  ensureArray: () => import_internal.ensureArray,
  findInsertIndex: () => import_internal.findInsertIndex,
  flatten: () => import_internal.flatten,
  groupBy: () => import_internal.groupBy,
  has: () => import_internal.has,
  hashCode: () => import_internal.hashCode,
  intersection: () => import_internal.intersection,
  isArray: () => import_internal.isArray,
  isBoolean: () => import_internal.isBoolean,
  isDate: () => import_internal.isDate,
  isEmpty: () => import_internal.isEmpty,
  isEqual: () => import_internal.isEqual,
  isFunction: () => import_internal.isFunction,
  isInteger: () => import_internal.isInteger,
  isNil: () => import_internal.isNil,
  isNumber: () => import_internal.isNumber,
  isObject: () => import_internal.isObject,
  isObjectLike: () => import_internal.isObjectLike,
  isOperator: () => import_internal.isOperator,
  isRegExp: () => import_internal.isRegExp,
  isString: () => import_internal.isString,
  isSymbol: () => import_internal.isSymbol,
  normalize: () => import_internal.normalize,
  removeValue: () => import_internal.removeValue,
  resolve: () => import_internal.resolve,
  setValue: () => import_internal.setValue,
  typeOf: () => import_internal.typeOf,
  unique: () => import_internal.unique
});
module.exports = __toCommonJS(util_exports);
var import_internal = require("./_internal");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HashMap,
  MingoError,
  assert,
  cloneDeep,
  compare,
  ensureArray,
  findInsertIndex,
  flatten,
  groupBy,
  has,
  hashCode,
  intersection,
  isArray,
  isBoolean,
  isDate,
  isEmpty,
  isEqual,
  isFunction,
  isInteger,
  isNil,
  isNumber,
  isObject,
  isObjectLike,
  isOperator,
  isRegExp,
  isString,
  isSymbol,
  normalize,
  removeValue,
  resolve,
  setValue,
  typeOf,
  unique
});
