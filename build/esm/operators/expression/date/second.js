import { computeDate } from "./_internal";
const $second = (obj, expr, options) => computeDate(obj, expr, options).getUTCSeconds();
export {
  $second
};
