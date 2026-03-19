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
var sort_exports = {};
__export(sort_exports, {
  $sort: () => $sort
});
module.exports = __toCommonJS(sort_exports);
var import_lazy = require("../../lazy");
var import_util = require("../../util");
function $sort(coll, sortKeys, options) {
  (0, import_util.assert)(
    (0, import_util.isObject)(sortKeys) && Object.keys(sortKeys).length > 0,
    "$sort specification is invalid"
  );
  let cmp = import_util.compare;
  const collationSpec = options.collation;
  if ((0, import_util.isObject)(collationSpec) && (0, import_util.isString)(collationSpec.locale)) {
    cmp = collationComparator(collationSpec);
  }
  return coll.transform((coll2) => {
    const modifiers = Object.keys(sortKeys);
    for (const key of modifiers.reverse()) {
      const groups = (0, import_util.groupBy)(coll2, (obj) => (0, import_util.resolve)(obj, key));
      const sortedKeys = Array.from(groups.keys());
      let nativeSorted = false;
      if (cmp === import_util.compare) {
        let t_str = true;
        let t_num = true;
        nativeSorted = sortedKeys.every(
          (v) => +(t_str &&= (0, import_util.isString)(v)) ^ +(t_num &&= (0, import_util.isNumber)(v))
        );
        if (t_str) sortedKeys.sort();
        else if (t_num) {
          new Float64Array(sortedKeys).sort().forEach((v, i2) => sortedKeys[i2] = v);
        }
      }
      if (!nativeSorted) sortedKeys.sort(cmp);
      if (sortKeys[key] === -1) sortedKeys.reverse();
      let i = 0;
      for (const k of sortedKeys) for (const v of groups.get(k)) coll2[i++] = v;
      (0, import_util.assert)(i == coll2.length, "bug: counter must match collection size.");
    }
    return (0, import_lazy.Lazy)(coll2);
  });
}
const COLLATION_STRENGTH = {
  // Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A.
  1: "base",
  //  Only strings that differ in base letters or accents and other diacritic marks compare as unequal.
  // Examples: a ≠ b, a ≠ á, a = A.
  2: "accent",
  // Strings that differ in base letters, accents and other diacritic marks, or case compare as unequal.
  // Other differences may also be taken into consideration. Examples: a ≠ b, a ≠ á, a ≠ A
  3: "variant"
  // case - Only strings that differ in base letters or case compare as unequal. Examples: a ≠ b, a = á, a ≠ A.
};
function collationComparator(spec) {
  const localeOpt = {
    sensitivity: COLLATION_STRENGTH[spec.strength || 3],
    caseFirst: spec.caseFirst === "off" ? "false" : spec.caseFirst,
    numeric: spec.numericOrdering || false,
    ignorePunctuation: spec.alternate === "shifted"
  };
  if (spec.caseLevel === true) {
    if (localeOpt.sensitivity === "base") localeOpt.sensitivity = "case";
    if (localeOpt.sensitivity === "accent") localeOpt.sensitivity = "variant";
  }
  const collator = new Intl.Collator(spec.locale, localeOpt);
  return (a, b) => (0, import_util.isString)(a) && (0, import_util.isString)(b) ? collator.compare(a, b) : (0, import_util.compare)(a, b);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  $sort
});
