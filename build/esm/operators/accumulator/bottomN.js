import { evalExpr } from "../../core/_internal";
import { Lazy } from "../../lazy";
import { $sort } from "../pipeline/sort";
import { $push } from "./push";
const $bottomN = (coll, expr, options) => {
  const copts = options;
  const args = expr;
  const n = evalExpr(copts?.local?.groupId, args.n, copts);
  const result = $sort(Lazy(coll), args.sortBy, options).collect();
  const m = result.length;
  return $push(m <= n ? result : result.slice(m - n), args.output, copts);
};
export {
  $bottomN
};
