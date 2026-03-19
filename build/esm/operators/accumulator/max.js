import { compare, isNil } from "../../util";
import { $push } from "./push";
const $max = (coll, expr, options) => {
  const items = $push(coll, expr, options).filter((v) => !isNil(v));
  if (!items.length) return null;
  return items.reduce((r, v) => compare(r, v) >= 0 ? r : v);
};
export {
  $max
};
