import { computeDate, isoWeek } from "./_internal";
const $isoWeek = (obj, expr, options) => isoWeek(computeDate(obj, expr, options));
export {
  $isoWeek
};
