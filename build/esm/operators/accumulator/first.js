import { ComputeOptions, evalExpr } from "../../core/_internal";
const $first = (coll, expr, options) => {
  const obj = coll[0];
  const copts = ComputeOptions.init(options).update({ root: obj });
  return evalExpr(obj, expr, copts) ?? null;
};
export {
  $first
};
