import { computeDate } from "./_internal";
const $dayOfMonth = (obj, expr, options) => computeDate(obj, expr, options).getUTCDate();
export {
  $dayOfMonth
};
