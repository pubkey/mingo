import { computeDate } from "./_internal";
const $minute = (obj, expr, options) => computeDate(obj, expr, options).getUTCMinutes();
export {
  $minute
};
