import { ComputeOptions, evalExpr } from "../../../core/_internal";
const $let = (obj, expr, options) => {
  const variables = {};
  for (const [key, val] of Object.entries(expr.vars)) {
    variables[key] = evalExpr(obj, val, options);
  }
  return evalExpr(
    obj,
    expr.in,
    ComputeOptions.init(options).update({ variables })
  );
};
export {
  $let
};
