import { isNil } from "../../util";
const $mergeObjects = (coll, _expr, _options) => {
  const acc = {};
  for (const o of coll) {
    if (isNil(o)) continue;
    for (const k of Object.keys(o)) {
      if (o[k] !== void 0) acc[k] = o[k];
    }
  }
  return acc;
};
export {
  $mergeObjects
};
