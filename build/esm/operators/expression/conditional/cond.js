import { evalExpr } from "../../../core/_internal";
import { assert, isArray, isObject, truthy } from "../../../util/_internal";
const err = "$cond expects array(3) or object with 'if-then-else' expressions";
const $cond = (obj, expr, options) => {
  let ifExpr;
  let thenExpr;
  let elseExpr;
  if (isArray(expr)) {
    assert(expr.length === 3, err);
    ifExpr = expr[0];
    thenExpr = expr[1];
    elseExpr = expr[2];
  } else {
    assert(isObject(expr), err);
    ifExpr = expr.if;
    thenExpr = expr.then;
    elseExpr = expr.else;
  }
  const condition = truthy(
    evalExpr(obj, ifExpr, options),
    options.useStrictMode
  );
  return evalExpr(obj, condition ? thenExpr : elseExpr, options);
};
export {
  $cond
};
