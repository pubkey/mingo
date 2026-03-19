import { computeDate } from "./_internal";
const $dayOfWeek = (obj, expr, options) => computeDate(obj, expr, options).getUTCDay() + 1;
export {
  $dayOfWeek
};
