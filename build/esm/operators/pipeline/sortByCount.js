import { $group } from "./group";
import { $sort } from "./sort";
function $sortByCount(coll, expr, options) {
  return $sort(
    $group(coll, { _id: expr, count: { $sum: 1 } }, options),
    { count: -1 },
    options
  );
}
export {
  $sortByCount
};
