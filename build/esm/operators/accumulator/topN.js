import { evalExpr } from "../../core/_internal";
import { Lazy } from "../../lazy";
import { $sort } from "../pipeline/sort";
import { $push } from "./push";
const $topN = (coll, expr, options) => {
  const copts = options;
  const { n, sortBy } = evalExpr(copts?.local?.groupId, expr, copts);
  const result = $sort(Lazy(coll), sortBy, options).take(n).collect();
  return $push(result, expr.output, copts);
};
export {
  $topN
};
