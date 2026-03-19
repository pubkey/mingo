import { computeDate } from "./_internal";
const $millisecond = (obj, expr, options) => computeDate(obj, expr, options).getUTCMilliseconds();
export {
  $millisecond
};
