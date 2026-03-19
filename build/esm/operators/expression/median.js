import { evalExpr } from "../../core/_internal";
import { $median as __median } from "../accumulator/median";
const $median = (obj, expr, options) => {
  const input = evalExpr(obj, expr.input, options);
  return __median(input, { input: "$$CURRENT", method: expr.method }, options);
};
export {
  $median
};
