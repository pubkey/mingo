import { $percentile } from "./percentile";
const $median = (coll, expr, options) => $percentile(coll, { ...expr, p: [0.5] }, options)?.pop();
export {
  $median
};
