import { evalExpr } from "../../core/_internal";
import { Any, AnyObject, Options } from "../../types";
import { $percentile as __percentile } from "../accumulator/percentile";

interface InputExpr extends AnyObject {
  input: Any;
  p: Any[];
  method: "approximate";
}

/**
 * Returns an array of scalar values that correspond to specified percentile values.
 */
export const $percentile = (obj: AnyObject, expr: Any, options: Options) => {
  const input = evalExpr(obj, (expr as InputExpr).input, options) as number[];
  return __percentile(
    input,
    { ...(expr as InputExpr), input: "$$CURRENT" },
    options
  );
};
