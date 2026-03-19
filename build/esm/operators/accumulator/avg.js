import { isNumber } from "../../util";
import { $push } from "./push";
const $avg = (coll, expr, options) => {
  const data = $push(coll, expr, options).filter(isNumber);
  if (data.length === 0) return null;
  const sum = data.reduce((acc, n) => acc + n, 0);
  return sum / data.length;
};
export {
  $avg
};
