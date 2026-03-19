import { ComputeOptions, evalExpr } from "../../core/_internal";
import { isNil } from "../../util";
const $push = (coll, expr, options) => {
  if (isNil(expr)) return coll;
  const copts = ComputeOptions.init(options);
  const result = new Array(coll.length);
  for (let i = 0; i < coll.length; i++) {
    const root = coll[i];
    result[i] = evalExpr(root, expr, copts.update({ root })) ?? null;
  }
  return result;
};
export {
  $push
};
