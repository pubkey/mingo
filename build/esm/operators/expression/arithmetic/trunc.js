import { evalExpr } from "../../../core/_internal";
import { assert, isArray } from "../../../util";
import { truncate } from "./_internal";
const $trunc = (obj, expr, options) => {
  assert(isArray(expr), "$trunc expects array(2)");
  const [n, precision] = evalExpr(obj, expr, options);
  return truncate(n, precision ?? 0, {
    name: "$trunc",
    roundOff: false,
    failOnError: options.failOnError
  });
};
export {
  $trunc
};
