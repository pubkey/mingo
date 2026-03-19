import { $bottomN } from "./bottomN";
const $bottom = (coll, expr, options) => {
  return $bottomN(coll, { ...expr, n: 1 }, options);
};
export {
  $bottom
};
