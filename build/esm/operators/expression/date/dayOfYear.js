import { computeDate, dayOfYear } from "./_internal";
const $dayOfYear = (obj, expr, options) => dayOfYear(computeDate(obj, expr, options));
export {
  $dayOfYear
};
