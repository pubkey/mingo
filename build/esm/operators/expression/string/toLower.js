import { isArray } from "../../../util/_internal";
import { $toString } from "../type";
const $toLower = (obj, expr, options) => {
  if (isArray(expr) && expr.length === 1) expr = expr[0];
  const s = $toString(obj, expr, options);
  return s === null ? s : s.toLowerCase();
};
export {
  $toLower
};
