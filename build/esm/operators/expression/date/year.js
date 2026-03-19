import { computeDate } from "./_internal";
const $year = (obj, expr, options) => computeDate(obj, expr, options).getUTCFullYear();
export {
  $year
};
