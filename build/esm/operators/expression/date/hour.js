import { computeDate } from "./_internal";
const $hour = (obj, expr, options) => computeDate(obj, expr, options).getUTCHours();
export {
  $hour
};
