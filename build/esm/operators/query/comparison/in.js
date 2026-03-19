import {
  ensureArray,
  isNil,
  isPrimitive,
  resolve
} from "../../../util/_internal";
import { $in as __in, processQuery } from "../../_predicates";
const $in = (selector, value, options) => {
  const b = value;
  if (b.every(isPrimitive)) {
    const set = new Set(b);
    const pathArray = selector.split(".");
    return (o) => {
      const a = resolve(o, selector, { unwrapArray: true }, pathArray);
      if (isNil(a)) return set.has(null);
      return ensureArray(a).some((v) => set.has(v));
    };
  }
  return processQuery(selector, value, options, __in);
};
export {
  $in
};
