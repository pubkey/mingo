import { isNumber } from "../../util";
import { $push } from "./push";
const $sum = (coll, expr, options) => {
  if (isNumber(expr)) return coll.length * expr;
  const nums = $push(coll, expr, options).filter(isNumber);
  return nums.reduce((r, n) => r + n, 0);
};
export {
  $sum
};
