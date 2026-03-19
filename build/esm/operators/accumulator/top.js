import { $topN } from "./topN";
const $top = (coll, expr, options) => $topN(coll, { ...expr, n: 1 }, options);
export {
  $top
};
