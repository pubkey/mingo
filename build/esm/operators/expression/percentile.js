import { evalExpr } from "../../core/_internal";
import { $percentile as __percentile } from "../accumulator/percentile";
const $percentile = (obj, expr, options) => {
  const input = evalExpr(obj, expr.input, options);
  return __percentile(
    input,
    { ...expr, input: "$$CURRENT" },
    options
  );
};
export {
  $percentile
};
