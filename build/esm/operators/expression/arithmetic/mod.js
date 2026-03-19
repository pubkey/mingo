import { evalExpr } from "../../../core/_internal";
import { isArray } from "../../../util";
import { errExpectArray } from "../_internal";
const $mod = (obj, expr, options) => {
  const args = evalExpr(obj, expr, options);
  let invalid = !isArray(args) || args.length != 2;
  invalid ||= !args.every((v) => typeof v === "number");
  if (invalid)
    return errExpectArray(options.failOnError, "$mod", {
      size: 2,
      type: "number"
    });
  return args[0] % args[1];
};
export {
  $mod
};
