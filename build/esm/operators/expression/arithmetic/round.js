import { evalExpr } from "../../../core/_internal";
import { assert, isArray } from "../../../util";
import { truncate } from "./_internal";
const $round = (obj, expr, options) => {
  assert(isArray(expr), "$round expects array(2)");
  const [n, precision] = evalExpr(obj, expr, options);
  return truncate(n, precision ?? 0, {
    name: "$round",
    roundOff: true,
    failOnError: options.failOnError
  });
};
export {
  $round
};
