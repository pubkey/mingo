import { computeDate } from "./_internal";
const $isoDayOfWeek = (obj, expr, options) => computeDate(obj, expr, options).getUTCDay() || 7;
export {
  $isoDayOfWeek
};
