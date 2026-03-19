import { evalExpr } from "../../../core/_internal";
import { isArray, isNil } from "../../../util";
import { errExpectArray } from "../_internal";
const $log = (obj, expr, options) => {
  const args = evalExpr(obj, expr, options);
  if (isArray(args) && args.length == 2) {
    if (args.some(isNil)) return null;
    if (args.every((v) => typeof v === "number"))
      return Math.log10(args[0]) / Math.log10(args[1]);
  }
  return errExpectArray(options.failOnError, "$log", {
    size: 2,
    type: "number"
  });
};
export {
  $log
};
