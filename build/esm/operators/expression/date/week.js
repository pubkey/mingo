import { computeDate, weekOfYear } from "./_internal";
const $week = (obj, expr, options) => weekOfYear(computeDate(obj, expr, options));
export {
  $week
};
