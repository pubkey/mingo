import { ComputeOptions, evalExpr } from "../../../core/_internal";
import { assert, has, isArray, isNil, isObject, isString } from "../../../util";
import { errExpectArray, errExpectString } from "../_internal";
const $map = (obj, expr, options) => {
  assert(
    isObject(expr) && has(expr, "input", "in"),
    "$map expects object { input, as, in }"
  );
  const input = evalExpr(obj, expr.input, options);
  const foe = options.failOnError;
  if (isNil(input)) return null;
  if (!isArray(input)) return errExpectArray(foe, "$map 'input'");
  if (!isNil(expr.as) && !isString(expr.as))
    return errExpectString(foe, "$map 'as'");
  const copts = ComputeOptions.init(options);
  const k = expr.as || "this";
  const locals = { variables: {} };
  return input.map((o) => {
    locals.variables[k] = o;
    return evalExpr(obj, expr.in, copts.update(locals));
  });
};
export {
  $map
};
