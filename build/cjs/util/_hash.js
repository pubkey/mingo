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
var hash_exports = {};
__export(hash_exports, {
  hashCode: () => hashCode
});
module.exports = __toCommonJS(hash_exports);
const MULTIPLIER = 16777619;
function mix(h, x) {
  return h * MULTIPLIER ^ x >>> 0;
}
function hashNumber(n) {
  if (Number.isNaN(n)) return 2143289344;
  if (!Number.isFinite(n)) return n > 0 ? 2139095040 : 4286578688;
  const intPart = Math.trunc(n);
  const frac = n - intPart;
  let h = intPart | 0;
  if (frac !== 0) {
    const scaled = Math.floor(frac * 4294967296);
    h = mix(h, scaled | 0);
  }
  return h >>> 0;
}
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = mix(h, str.charCodeAt(i));
  }
  return h >>> 0;
}
function hashBigInt(b) {
  let h = 0;
  const isNegative = b < 0n;
  let x = isNegative ? -b : b;
  if (x === 0n) {
    h = mix(h, 0);
  } else {
    while (x > 0n) {
      const byte = Number(x & 0xffn);
      h = mix(h, byte);
      x >>= 8n;
    }
  }
  return mix(h, +isNegative) >>> 0;
}
function hashFunction(fn) {
  let h = hashString((fn.name || "") + fn.toString());
  h = mix(h, fn.length);
  return h >>> 0;
}
function hashBytes(bytes) {
  let h = 0;
  for (let i = 0; i < bytes.length; i++) {
    h = mix(h, bytes[i]);
  }
  return h >>> 0;
}
function hashTypedArray(view) {
  let h = hashString(view.constructor.name);
  const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  h = mix(h, hashBytes(bytes));
  return h >>> 0;
}
function hashArray(arr, seen) {
  if (seen.has(arr)) return 13 /* Cycle */;
  seen.add(arr);
  let h = 1;
  for (let i = 0; i < arr.length; i++) {
    h = mix(h, internalHash(arr[i], seen));
  }
  seen.delete(arr);
  return h >>> 0;
}
function hashObject(obj, seen) {
  if (seen.has(obj)) return 13 /* Cycle */;
  seen.add(obj);
  const keys = Object.keys(obj).sort();
  let h = hashString(obj?.constructor?.name);
  for (const k of keys) {
    h = mix(h, hashString(k));
    h = mix(h, internalHash(obj[k], seen));
  }
  seen.delete(obj);
  return h >>> 0;
}
const BOOLEAN_HASH = [3735928559, 305441741].map((b) => mix(3 /* Boolean */, b));
const NULL_HASH = mix(1 /* Null */, 0);
const UNDEF_HASH = mix(2 /* Undefined */, 0);
function internalHash(value, seen) {
  if (value === null) return NULL_HASH;
  const t = typeof value;
  switch (t) {
    case "undefined":
      return UNDEF_HASH;
    case "boolean":
      return BOOLEAN_HASH[+value];
    case "number":
      return mix(4 /* Number */, hashNumber(value));
    case "string":
      return mix(5 /* String */, hashString(value));
    case "bigint":
      return mix(6 /* BigInt */, hashBigInt(value));
    case "function":
      return mix(7 /* Function */, hashFunction(value));
    default: {
      if (ArrayBuffer.isView(value) && !(value instanceof DataView))
        return mix(12 /* TypedArray */, hashTypedArray(value));
      if (value instanceof Date)
        return mix(10 /* Date */, hashNumber(value.getTime()));
      if (value instanceof RegExp) {
        const h = hashString(value.source);
        return mix(11 /* RegExp */, mix(h, hashString(value.flags)));
      }
      if (Array.isArray(value)) return mix(8 /* Array */, hashArray(value, seen));
      return mix(
        9 /* Object */,
        hashObject(value, seen)
      );
    }
  }
}
function hashCode(value) {
  return internalHash(value, /* @__PURE__ */ new WeakSet()) >>> 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  hashCode
});
