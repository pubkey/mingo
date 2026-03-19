import { isArray } from "../../../util";
import { $toString } from "../type";
const $toUpper = (obj, expr, options) => {
  if (isArray(expr) && expr.length === 1) expr = expr[0];
  const s = $toString(obj, expr, options);
  return s === null ? s : s.toUpperCase();
};
export {
  $toUpper
};
