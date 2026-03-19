import { Lazy } from "../../lazy";
import {
  assert,
  compare,
  groupBy,
  isNumber,
  isObject,
  isString,
  resolve
} from "../../util";
function $sort(coll, sortKeys, options) {
  assert(
    isObject(sortKeys) && Object.keys(sortKeys).length > 0,
    "$sort specification is invalid"
  );
  let cmp = compare;
  const collationSpec = options.collation;
  if (isObject(collationSpec) && isString(collationSpec.locale)) {
    cmp = collationComparator(collationSpec);
  }
  return coll.transform((coll2) => {
    const modifiers = Object.keys(sortKeys);
    for (const key of modifiers.reverse()) {
      const groups = groupBy(coll2, (obj) => resolve(obj, key));
      const sortedKeys = Array.from(groups.keys());
      let nativeSorted = false;
      if (cmp === compare) {
        let t_str = true;
        let t_num = true;
        nativeSorted = sortedKeys.every(
          (v) => +(t_str &&= isString(v)) ^ +(t_num &&= isNumber(v))
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
      assert(i == coll2.length, "bug: counter must match collection size.");
    }
    return Lazy(coll2);
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
  return (a, b) => isString(a) && isString(b) ? collator.compare(a, b) : compare(a, b);
}
export {
  $sort
};
