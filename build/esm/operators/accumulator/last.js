import { ComputeOptions, evalExpr } from "../../core/_internal";
const $last = (coll, expr, options) => {
  const obj = coll[coll.length - 1];
  const copts = ComputeOptions.init(options).update({ root: obj });
  return evalExpr(obj, expr, copts) ?? null;
};
export {
  $last
};
