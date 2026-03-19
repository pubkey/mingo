import { computeDate } from "./_internal";
const $month = (obj, expr, options) => computeDate(obj, expr, options).getUTCMonth() + 1;
export {
  $month
};
