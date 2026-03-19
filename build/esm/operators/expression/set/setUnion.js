import { evalExpr } from "../../../core/_internal";
import { flatten, isArray, isNil, unique } from "../../../util";
import { errExpectArray } from "../_internal";
const $setUnion = (obj, expr, options) => {
  const args = evalExpr(obj, expr, options);
  const foe = options.failOnError;
  if (isNil(args)) return null;
  if (!isArray(args)) return errExpectArray(foe, "$setUnion");
  if (isArray(expr)) {
    if (!args.every(isArray)) return errExpectArray(foe, "$setUnion arguments");
    return unique(flatten(args));
  }
  return unique(args);
};
export {
  $setUnion
};
