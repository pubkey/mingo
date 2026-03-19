import { ComputeOptions, evalExpr } from "../../../core/_internal";
import { assert, has, isArray, isNil, isObject } from "../../../util";
import { errExpectArray } from "../_internal";
function $reduce(obj, expr, options) {
  assert(
    isObject(expr) && has(expr, "input", "initialValue", "in"),
    "$reduce expects object { input, initialValue, in }"
  );
  const input = evalExpr(obj, expr.input, options);
  const initialValue = evalExpr(obj, expr.initialValue, options);
  const inExpr = expr["in"];
  if (isNil(input)) return null;
  if (!isArray(input))
    return errExpectArray(options.failOnError, "$reduce 'input'");
  const copts = ComputeOptions.init(options);
  const locals = { variables: { value: null } };
  let result = initialValue;
  for (let i = 0; i < input.length; i++) {
    locals.variables.value = result;
    result = evalExpr(input[i], inExpr, copts.update(locals));
  }
  return result;
}
export {
  $reduce
};
